import { eq } from 'drizzle-orm'
import { characters, inventory, configRealms, type Realm } from '../../db/schema'
import {
  realmConfigs, isMaxLayer, getNextRealm,
  breakthroughBaseChance,
} from '../../utils/game-engine'
import { fireAchievementCheck } from '../../utils/achievement-engine'
import { resolveMajorBreakthrough } from '../../utils/cultivation-balance'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const body = await readBody(event)
  const usePill = !!body?.usePill

  const db = useDB()

  const char = await useCharacter(event)

  const currentRealm = char.realm as Realm
  const cfg = await getRealmConfig(db, currentRealm)
  const currentLingqi = parseFloat(char.lingqi)

  // Check if at cap
  if (currentLingqi < cfg.lingqiCap) {
    throw createError({ statusCode: 400, message: '灵气尚未圆满，继续修炼' })
  }

  // If not at max layer, advance layer automatically
  if (!isMaxLayer(currentRealm, char.realmLayer)) {
    const [updated] = await db.update(characters)
      .set({
        realmLayer: char.realmLayer + 1,
        lingqi: '0',
        updatedAt: new Date(),
      })
      .where(eq(characters.id, char.id))
      .returning()

    return { success: true, message: `突破至${cfg.label}第${char.realmLayer + 1}层`, character: updated }
  }

  // Big realm breakthrough
  const nextRealm = getNextRealm(currentRealm)
  if (!nextRealm) {
    throw createError({ statusCode: 400, message: '已达最高境界，无可突破' })
  }

  // Check for breakthrough pill
  let hasPill = false
  if (usePill) {
    const pillKey = getBreakthroughPillForRealm(currentRealm)
    if (pillKey) {
      const [inv] = await db.select()
        .from(inventory)
        .where(eq(inventory.characterId, char.id))
        .where(eq(inventory.itemId, pillKey))
        .limit(1)

      if (inv && inv.quantity > 0) {
        hasPill = true
        await db.update(inventory)
          .set({ quantity: inv.quantity - 1, updatedAt: new Date() })
          .where(eq(inventory.id, inv.id))
      }
    }
  }

  const baseChance = breakthroughBaseChance[`${currentRealm}→${nextRealm}`] ?? 0.15
  const roll = getBreakthroughRoll(event)
  const pillBonus = hasPill ? 0.2 : 0
  const breakthrough = resolveMajorBreakthrough({
    baseChance: Math.min(baseChance + pillBonus, 0.9),
    failureCount: char.breakthroughFailureCount,
    lingqiCap: cfg.lingqiCap,
    progressRetainRate: cfg.progressRetainRate ?? 0,
    pityChanceStep: cfg.pityChanceStep ?? 0,
    pityChanceMax: cfg.pityChanceMax ?? 0,
    roll,
  })

  if (breakthrough.success) {
    const nextCfg = await getRealmConfig(db, nextRealm)
    const [updated] = await db.update(characters)
      .set({
        realm: nextRealm,
        realmLayer: 1,
        lingqi: '0',
        lingqiCap: String(nextCfg.lingqiCap),
        lingshiRate: String(nextCfg.lingshiRate),
        lingqiRate: String(nextCfg.lingqiRate),
        breakthroughFailureCount: 0,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, char.id))
      .returning()

    fireAchievementCheck(event, 'breakthrough', nextRealm)
    return {
      success: true,
      message: `天降福缘！成功突破至${cfg.label}→${nextCfg.label}！`,
      character: updated,
      baseChance,
      effectiveChance: breakthrough.effectiveChance,
      pityBonus: breakthrough.pityBonus,
    }
  } else {
    const [updated] = await db.update(characters)
      .set({
        lingqi: String(breakthrough.nextLingqi),
        breakthroughFailureCount: breakthrough.nextFailureCount,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, char.id))
      .returning()

    return {
      success: false,
      message: '突破失败，灵气溃散，需重新积累',
      character: updated,
      baseChance,
      effectiveChance: breakthrough.effectiveChance,
      pityBonus: breakthrough.pityBonus,
      nextFailureCount: breakthrough.nextFailureCount,
      hadPill: hasPill,
    }
  }
})

async function getRealmConfig(db: ReturnType<typeof useDB>, realm: Realm) {
  const [configured] = await db.select().from(configRealms).where(eq(configRealms.key, realm)).limit(1)
  if (!configured) return realmConfigs[realm]

  return {
    label: configured.label,
    lingqiCap: parseFloat(configured.lingqiCap),
    lingshiRate: parseFloat(configured.lingshiRate),
    lingqiRate: parseFloat(configured.lingqiRate),
    progressRetainRate: configured.progressRetainRate == null ? undefined : parseFloat(configured.progressRetainRate),
    pityChanceStep: configured.pityChanceStep == null ? undefined : parseFloat(configured.pityChanceStep),
    pityChanceMax: configured.pityChanceMax == null ? undefined : parseFloat(configured.pityChanceMax),
  }
}

function getBreakthroughRoll(event: any) {
  const forcedRoll = getHeader(event, 'x-test-breakthrough-roll')
  if (!forcedRoll) return Math.random()
  const parsed = Number(forcedRoll)
  if (Number.isNaN(parsed)) return Math.random()
  return parsed
}

function getBreakthroughPillForRealm(realm: Realm): string | null {
  const map: Record<string, string> = {
    condensing_qi: 'zhuji_dan',
    foundation: 'tianli_dan',
    core_formation: 'qingyun_dan',
    nascent_soul: 'huashen_dan',
    deity_transformation: 'yingbian_dan',
    nascent_transformation: 'wending_dan',
  }
  return map[realm] || null
}
