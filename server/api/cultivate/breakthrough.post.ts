import { eq } from 'drizzle-orm'
import { characters, inventory, realmEnum, type Realm } from '../../db/schema'
import {
  realmConfigs, isMaxLayer, getNextRealm, getMaxLayer,
  breakthroughRoll, getPillBreakthroughBonus, breakthroughBaseChance,
} from '../../utils/game-engine'
import { fireAchievementCheck } from '../../utils/achievement-engine'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const body = await readBody(event)
  const usePill = !!body?.usePill

  const db = useDB()

  const [char] = await db.select().from(characters).where(eq(characters.userId, userId))
  if (!char) {
    throw createError({ statusCode: 404, message: '角色不存在' })
  }

  const currentRealm = char.realm as Realm
  const cfg = realmConfigs[currentRealm]
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

  const success = breakthroughRoll(currentRealm, hasPill)
  const baseChance = breakthroughBaseChance[`${currentRealm}→${nextRealm}`] ?? 0.15

  if (success) {
    const nextCfg = realmConfigs[nextRealm]
    const [updated] = await db.update(characters)
      .set({
        realm: nextRealm,
        realmLayer: 1,
        lingqi: '0',
        lingqiCap: String(nextCfg.lingqiCap),
        lingshiRate: String(nextCfg.lingshiRate),
        lingqiRate: String(nextCfg.lingqiRate),
        updatedAt: new Date(),
      })
      .where(eq(characters.id, char.id))
      .returning()

    fireAchievementCheck(event, 'breakthrough', nextRealm)
    return {
      success: true,
      message: `天降福缘！成功突破至${cfg.label}→${nextCfg.label}！`,
      character: updated,
    }
  } else {
    // Failed - reset lingqi progress
    const [updated] = await db.update(characters)
      .set({
        lingqi: '0',
        updatedAt: new Date(),
      })
      .where(eq(characters.id, char.id))
      .returning()

    return {
      success: false,
      message: '突破失败，灵气溃散，需重新积累',
      character: updated,
      baseChance,
      hadPill: hasPill,
    }
  }
})

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
