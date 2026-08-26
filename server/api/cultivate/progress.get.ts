import { eq, and, sql } from 'drizzle-orm'
import { characters, equipment, clanMembers, clans } from '../../db/schema'
import { type Realm, isMaxLayer } from '../../utils/realm-config'
import { getRealmFromDB, getClanLevelBonusFromDB } from '../../utils/config'
import { isPillBuffActive } from '../../utils/pill-buff'

/**
 * 挂机收益结算（行锁串行化）。
 *
 * - 事务 + SELECT ... FOR UPDATE：并发请求（双开标签页）在此排队，
 *   后到的请求会看到已被推进的 offline_started_at，只结算自己那段窗口。
 * - 加成体系：基础速率 + 装备加成（加法区）→ × 丹药 buff（乘区，分段计费）→ × 宗门等级加成（乘区）。
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

    // ── 装备加成（已穿戴合计，加法区）──
    const [equipAgg] = await tx.select({
      qi: sql<string>`coalesce(sum(${equipment.bonusLingqiRate}), 0)`,
      shi: sql<string>`coalesce(sum(${equipment.bonusLingshiRate}), 0)`,
    }).from(equipment)
      .where(and(eq(equipment.characterId, char.id), eq(equipment.equipped, 1)))
    const equipQi = parseFloat(equipAgg?.qi || '0')
    const equipShi = parseFloat(equipAgg?.shi || '0')

    // ── 宗门等级加成（乘区）──
    const [memberRow] = await tx.select({ level: clans.level })
      .from(clanMembers)
      .innerJoin(clans, eq(clanMembers.clanId, clans.id))
      .where(eq(clanMembers.characterId, char.id))
      .limit(1)
    const clanBonus = memberRow ? await getClanLevelBonusFromDB(tx, memberRow.level) : 0

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
    const pillBonus = buffedMinutes > 0 ? parseFloat(char.pillBuffRate || '0') : 0

    const baseQi = cfg.lingqiRate + equipQi
    const baseShi = cfg.lingshiRate + equipShi
    const lingqiGain = (baseQi * plainMinutes + baseQi * (1 + pillBonus) * buffedMinutes) * (1 + clanBonus)
    const lingshiGain = baseShi * effectiveMinutes * (1 + clanBonus)

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
        equipBonusQi: equipQi,
        clanBonus,
        pillBonus,
      },
      autoBreakthroughs,
      realmConfig: cfg,
      nextRealmCap: cfg.lingqiCap,
    }
  })
})
