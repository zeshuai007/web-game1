import { eq } from 'drizzle-orm'
import { characters } from '../../db/schema'
import { type Realm } from '../../utils/realm-config'
import { getRealmFromDB } from '../../utils/config'

/**
 * 挂机收益结算（行锁串行化）。
 *
 * 事务 + SELECT ... FOR UPDATE：并发请求（双开标签页）在此排队，
 * 后到的请求会看到已被推进的 offline_started_at，只结算自己那段窗口，
 * 杜绝此前「读到同一时间戳 → 收益双倍结算」的竞态。
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

    // Calculate offline earnings (capped at 24h)
    const lastOnline = new Date(char.offlineStartedAt)
    const elapsedMs = Math.max(0, now.getTime() - lastOnline.getTime())
    const elapsedMinutes = elapsedMs / (1000 * 60)
    const cap = 24 * 60
    const effectiveMinutes = Math.min(elapsedMinutes, cap)

    const lingqiGain = cfg.lingqiRate * effectiveMinutes
    const lingshiGain = cfg.lingshiRate * effectiveMinutes

    // Update character with offline earnings (lingqi capped at realm cap)
    const currentLingqi = parseFloat(char.lingqi)
    const newLingqi = currentLingqi >= cfg.lingqiCap
      ? currentLingqi
      : Math.min(currentLingqi + lingqiGain, cfg.lingqiCap)
    const newLingshi = parseFloat(char.lingshi) + lingshiGain

    const [updated] = await tx.update(characters)
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

    return {
      character: updated,
      offlineEarnings: {
        lingqi: lingqiGain,
        lingshi: lingshiGain,
        minutes: effectiveMinutes,
      },
      realmConfig: cfg,
      nextRealmCap: cfg.lingqiCap,
    }
  })
})
