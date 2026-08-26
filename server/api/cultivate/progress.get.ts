import { eq } from 'drizzle-orm'
import { characters } from '../../db/schema'
import { type Realm, isMaxLayer } from '../../utils/realm-config'
import { getRealmFromDB } from '../../utils/config'
import { isPillBuffActive } from '../../utils/pill-buff'

/**
 * 挂机收益结算（行锁串行化）。
 *
 * - 事务 + SELECT ... FOR UPDATE：并发请求（双开标签页）在此排队，
 *   后到的请求会看到已被推进的 offline_started_at，只结算自己那段窗口。
 * - 修炼丹 buff 分段计费：离线窗口中处于 buff 有效期内的部分按加成速率结算。
 * - 小境界自动晋升（PRD US8「无需操作」）：灵气攒满且非大境界瓶颈时逐层推进，
 *   离线期间同样生效；大境界突破仍由玩家主动触发。
 */
export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const db = useDB()

  return db.transaction(async (tx) => {
    const [char] = await tx.select().from(characters)
      .where(eq(characters.userId, userId))
      .for('update')
    if (!char) {
      throw createError({ statusCode: 404, message: '角色不存在' })
    }

    const cfg = await getRealmFromDB(tx, char.realm as Realm)
    if (!cfg) {
      throw createError({ statusCode: 500, message: '境界配置不存在' })
    }

    const now = new Date()
    const lastOnline = new Date(char.offlineStartedAt)

    // Calculate offline earnings (capped at 24h)
    const elapsedMs = Math.max(0, now.getTime() - lastOnline.getTime())
    const elapsedMinutes = elapsedMs / (1000 * 60)
    const cap = 24 * 60
    const effectiveMinutes = Math.min(elapsedMinutes, cap)

    // ── 丹药 buff 分段计费：离线窗口内落在 buff 有效期的部分享受加成 ──
    let buffedMinutes = 0
    if (isPillBuffActive(char)) {
      const buffEndMs = new Date(char.pillBuffUntil!).getTime() - lastOnline.getTime()
      buffedMinutes = Math.max(0, Math.min(buffEndMs / (1000 * 60), effectiveMinutes))
    }
    const plainMinutes = effectiveMinutes - buffedMinutes
    const bonusRate = buffedMinutes > 0 ? parseFloat(char.pillBuffRate || '0') : 0

    const lingqiGain = cfg.lingqiRate * plainMinutes + cfg.lingqiRate * (1 + bonusRate) * buffedMinutes
    const lingshiGain = cfg.lingshiRate * effectiveMinutes // 丹药只加速灵气，不影响灵石

    // Update character with offline earnings (lingqi capped at realm cap)
    const currentLingqi = parseFloat(char.lingqi)
    const newLingqi = currentLingqi >= cfg.lingqiCap
      ? currentLingqi
      : Math.min(currentLingqi + lingqiGain, cfg.lingqiCap)
    const newLingshi = parseFloat(char.lingshi) + lingshiGain

    const [settled] = await tx.update(characters)
      .set({
        lingqi: String(newLingqi),
        lingshi: String(newLingshi),
        lingqiCap: String(cfg.lingqiCap),
        lingqiRate: String(cfg.lingqiRate),
        lingshiRate: String(cfg.lingshiRate),
        offlineStartedAt: now,
        updatedAt: now,
      })
      .where(eq(characters.id, char.id))
      .returning()

    // ── 小境界自动晋升：灵气攒满且非大境界瓶颈时逐层推进（PRD US8「无需操作」）──
    let updated = settled
    let autoBreakthroughs = 0
    while (
      parseFloat(updated.lingqi) >= parseFloat(updated.lingqiCap)
      && !isMaxLayer(updated.realm as Realm, updated.realmLayer)
      && updated.realm !== 'seeking_heaven'
    ) {
      const [next] = await tx.update(characters)
        .set({
          realmLayer: updated.realmLayer + 1,
          lingqi: '0',
          updatedAt: now,
        })
        .where(eq(characters.id, char.id))
        .returning()
      updated = next
      autoBreakthroughs++
    }

    return {
      character: updated,
      offlineEarnings: {
        lingqi: lingqiGain,
        lingshi: lingshiGain,
        minutes: effectiveMinutes,
      },
      autoBreakthroughs,
      realmConfig: cfg,
      nextRealmCap: cfg.lingqiCap,
    }
  })
})
