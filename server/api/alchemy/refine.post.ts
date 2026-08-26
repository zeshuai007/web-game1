import { eq, and } from 'drizzle-orm'
import { characters, inventory, alchemyRecords, pillTypeEnum, configAlchemyRecipes } from '../../db/schema'

/**
 * 炼丹（事务化）。
 *
 * 全程包裹在事务中并以行锁串行化：
 * - 先整体校验灵石与全部材料充足，再开始写库（不会出现「扣到一半失败」）
 * - 灵石、材料、丹药入包原子提交，异常整体回滚
 */
export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const body = await readBody(event)
  const { pillType } = body || {}
  const db = useDB()

  if (!pillType || !pillTypeEnum.includes(pillType as any)) {
    throw createError({ statusCode: 400, message: '无效的丹药类型' })
  }

  const [recipe] = await db.select().from(configAlchemyRecipes).where(eq(configAlchemyRecipes.pillId, pillType)).limit(1)
  if (!recipe) throw createError({ statusCode: 400, message: '未知的丹方' })

  const cost = recipe.cost
  const materials: Record<string, number> = {}
  for (const m of JSON.parse(recipe.materialsJson) as { id: string; quantity: number }[]) {
    materials[m.id] = m.quantity
  }

  return db.transaction(async (tx) => {
    const [char] = await tx.select().from(characters)
      .where(eq(characters.userId, userId))
      .for('update')
    if (!char) throw createError({ statusCode: 404, message: '角色不存在' })

    // ── 校验阶段：全部通过才开始写库 ──
    if (parseFloat(char.lingshi) < cost) {
      throw createError({ statusCode: 400, message: '灵石不足' })
    }
    const consumed: { invId: string; quantity: number }[] = []
    for (const [materialId, qty] of Object.entries(materials)) {
      const [inv] = await tx.select().from(inventory)
        .where(and(eq(inventory.characterId, char.id), eq(inventory.itemId, materialId)))
        .limit(1)
      if (!inv || inv.quantity < qty) {
        throw createError({ statusCode: 400, message: `材料不足：${materialId}` })
      }
      consumed.push({ invId: inv.id, quantity: qty })
    }

    // ── 写入阶段：任一步失败整体回滚 ──
    const now = new Date()
    await tx.update(characters)
      .set({ lingshi: String(parseFloat(char.lingshi) - cost), updatedAt: now })
      .where(eq(characters.id, char.id))

    for (const { invId, quantity } of consumed) {
      const [inv] = await tx.select().from(inventory).where(eq(inventory.id, invId)).limit(1)
      await tx.update(inventory)
        .set({ quantity: (inv?.quantity ?? quantity) - quantity, updatedAt: now })
        .where(eq(inventory.id, invId))
    }

    const [existingPill] = await tx.select().from(inventory)
      .where(and(eq(inventory.characterId, char.id), eq(inventory.itemId, pillType), eq(inventory.itemType, 'pill')))
      .limit(1)

    if (existingPill) {
      await tx.update(inventory)
        .set({ quantity: existingPill.quantity + 1, updatedAt: now })
        .where(eq(inventory.id, existingPill.id))
    } else {
      await tx.insert(inventory).values({ characterId: char.id, itemType: 'pill', itemId: pillType, quantity: 1 })
    }

    await tx.insert(alchemyRecords).values({ characterId: char.id, pillType, quantity: 1 })
    return { success: true, message: '炼丹成功！' }
  })
})
