import { eq, and } from 'drizzle-orm'
import { characters, inventory, type Realm } from '../../db/schema'
import { isMaxLayer, getNextRealm } from '../../utils/realm-config'
import { getRealmFromDB, getBreakthroughChanceFromDB } from '../../utils/config'
import { resolveMajorBreakthrough } from '../../utils/cultivation-balance'
import { createSystemMessage } from '../../utils/chat-engine'
import { publishWorldMessage } from '../../utils/pusher'

/**
 * 突破（小境界自动晋升 / 大境界概率突破）。
 *
 * 全程包裹在事务中并以行锁（FOR UPDATE）串行化：
 * - 双击/多端并发只会有一份灵气圆满被判定，不会双 roll
 * - 丹药扣除、角色更新与判定结果原子提交，异常时整体回滚（丹不会白扣）
 * - 世界广播与成就检查在事务成功后触发，避免「广播了但回滚」
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const usePill = !!body?.usePill

  const db = useDB()
  let worldBroadcast: ReturnType<typeof createSystemMessage> | null = null
  let achievedRealm: Realm | null = null

  const payload = await db.transaction(async (tx) => {
    // 行锁重读角色（event.context 缓存值可能过期）
    const [char] = await tx.select().from(characters)
      .where(eq(characters.userId, event.context.userId))
      .for('update')
    if (!char) {
      throw createError({ statusCode: 404, message: '角色不存在' })
    }
    event.context.character = char

    const currentRealm = char.realm as Realm
    const cfg = await getRealmFromDB(tx, currentRealm)
    if (!cfg) {
      throw createError({ statusCode: 500, message: '境界配置不存在' })
    }

    // Check if at cap
    if (parseFloat(char.lingqi) < cfg.lingqiCap) {
      throw createError({ statusCode: 400, message: '灵气尚未圆满，继续修炼' })
    }

    // If not at max layer, advance layer automatically
    if (!isMaxLayer(currentRealm, char.realmLayer)) {
      const [updated] = await tx.update(characters)
        .set({
          realmLayer: char.realmLayer + 1,
          lingqi: '0',
          updatedAt: new Date(),
        })
        .where(eq(characters.id, char.id))
        .returning()

      return { success: true as const, message: `突破至${cfg.label}第${char.realmLayer + 1}层`, character: updated }
    }

    // Big realm breakthrough
    const nextRealm = getNextRealm(currentRealm)
    if (!nextRealm) {
      throw createError({ statusCode: 400, message: '已达最高境界，无可突破' })
    }

    // Consume breakthrough pill inside the same transaction
    let hasPill = false
    if (usePill) {
      const pillKey = getBreakthroughPillForRealm(currentRealm)
      if (pillKey) {
        const [inv] = await tx.select().from(inventory)
          .where(and(eq(inventory.characterId, char.id), eq(inventory.itemId, pillKey)))
          .limit(1)

        if (inv && inv.quantity > 0) {
          hasPill = true
          await tx.update(inventory)
            .set({ quantity: inv.quantity - 1, updatedAt: new Date() })
            .where(eq(inventory.id, inv.id))
        }
      }
    }

    const baseChance = await getBreakthroughChanceFromDB(tx, currentRealm)
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
      const nextCfg = await getRealmFromDB(tx, nextRealm)
      if (!nextCfg) {
        throw createError({ statusCode: 500, message: '下一境界配置不存在' })
      }

      const [updated] = await tx.update(characters)
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

      achievedRealm = nextRealm
      worldBroadcast = createSystemMessage(`【系统】${char.nickname}突破至${nextCfg.label}！`)
      return {
        success: true as const,
        message: `天降福缘！成功突破至${cfg.label}→${nextCfg.label}！`,
        character: updated,
        baseChance,
        effectiveChance: breakthrough.effectiveChance,
        pityBonus: breakthrough.pityBonus,
        worldBroadcast,
      }
    } else {
      const [updated] = await tx.update(characters)
        .set({
          lingqi: String(breakthrough.nextLingqi),
          breakthroughFailureCount: breakthrough.nextFailureCount,
          updatedAt: new Date(),
        })
        .where(eq(characters.id, char.id))
        .returning()

      return {
        success: false as const,
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

  // Post-transaction side effects (only after a successful commit)
  if (achievedRealm) {
    fireAchievementCheck(event, 'breakthrough', achievedRealm)
  }
  if (worldBroadcast) {
    await publishWorldMessage(worldBroadcast)
  }

  return payload
})

function getBreakthroughRoll(event: any) {
  // Test-only override — ignored unless test mode is enabled (never in production by default)
  const forcedRoll = isTestModeEnabled() ? getHeader(event, 'x-test-breakthrough-roll') : undefined
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
