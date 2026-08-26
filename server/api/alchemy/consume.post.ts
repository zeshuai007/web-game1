import { eq, and } from 'drizzle-orm'
import { characters, inventory, configAlchemyRecipes } from '../../db/schema'
import { PILL_BUFF_DURATION_MS, parsePillBonusRate } from '../../utils/pill-buff'

/**
 * 服用修炼丹（PRD US13：加速灵气获取）。
 *
 * - 仅限 type=cultivation 的丹药（破境丹走突破流程消耗，不可在此服用）
 * - 单槽覆盖制：服用新的丹药会覆盖当前 buff（时长刷新、倍率以新丹为准）
 * - 加成只作用于灵气速率；灵石产出不受影响
 */
export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const body = await readBody(event)
  const { itemId } = body || {}
  const db = useDB()

  if (!itemId) throw createError({ statusCode: 400, message: '缺少丹药ID' })

  const [recipe] = await db.select().from(configAlchemyRecipes).where(eq(configAlchemyRecipes.pillId, itemId)).limit(1)
  if (!recipe) throw createError({ statusCode: 400, message: '未知的丹药' })
  if (recipe.type !== 'cultivation') {
    throw createError({ statusCode: 400, message: '该丹药不是修炼丹' })
  }
  const bonusRate = parsePillBonusRate(recipe.effect)
  if (bonusRate <= 0) throw createError({ statusCode: 500, message: '丹方效果配置异常' })

  return db.transaction(async (tx) => {
    const [char] = await tx.select().from(characters)
      .where(eq(characters.userId, userId))
      .for('update')
    if (!char) throw createError({ statusCode: 404, message: '角色不存在' })

    const [inv] = await tx.select().from(inventory)
      .where(and(eq(inventory.characterId, char.id), eq(inventory.itemId, itemId), eq(inventory.itemType, 'pill')))
      .limit(1)
    if (!inv || inv.quantity < 1) {
      throw createError({ statusCode: 400, message: '背包中没有该丹药' })
    }

    const now = new Date()
    await tx.update(inventory)
      .set({ quantity: inv.quantity - 1, updatedAt: now })
      .where(eq(inventory.id, inv.id))

    const pillBuffUntil = new Date(now.getTime() + PILL_BUFF_DURATION_MS)
    await tx.update(characters)
      .set({
        pillBuffItemId: itemId,
        pillBuffRate: String(bonusRate),
        pillBuffUntil,
        updatedAt: now,
      })
      .where(eq(characters.id, char.id))

    return {
      success: true,
      message: `服用${recipe.name}，灵气获取速度 +${Math.round(bonusRate * 100)}%（30 分钟）`,
      pillItemId: itemId,
      pillBuffRate: bonusRate,
      pillBuffUntil,
    }
  })
})
