import { eq, and } from 'drizzle-orm'
import { characters, inventory, alchemyRecords, pillTypeEnum, configAlchemyRecipes } from '../../db/schema'

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

  const materials: Record<string, number> = {}
  let cost = recipe.cost
  const parsed = JSON.parse(recipe.materialsJson) as { id: string; quantity: number }[]
  for (const m of parsed) materials[m.id] = m.quantity

  const char = await useCharacter(event)
  if (parseFloat(char.lingshi) < cost) throw createError({ statusCode: 400, message: '灵石不足' })

  await db.update(characters).set({ lingshi: String(parseFloat(char.lingshi) - cost) }).where(eq(characters.id, char.id))

  for (const [materialId, qty] of Object.entries(materials)) {
    const [inv] = await db.select().from(inventory)
      .where(and(eq(inventory.characterId, char.id), eq(inventory.itemId, materialId)))
    if (!inv || inv.quantity < qty) {
      await db.update(characters).set({ lingshi: String(parseFloat(char.lingshi)) }).where(eq(characters.id, char.id))
      throw createError({ statusCode: 400, message: `材料不足：${materialId}` })
    }
    await db.update(inventory).set({ quantity: inv.quantity - qty }).where(eq(inventory.id, inv.id))
  }

  const [existingPill] = await db.select().from(inventory)
    .where(and(eq(inventory.characterId, char.id), eq(inventory.itemId, pillType), eq(inventory.itemType, 'pill')))

  if (existingPill) {
    await db.update(inventory).set({ quantity: existingPill.quantity + 1 }).where(eq(inventory.id, existingPill.id))
  } else {
    await db.insert(inventory).values({ characterId: char.id, itemType: 'pill', itemId: pillType, quantity: 1 })
  }

  await db.insert(alchemyRecords).values({ characterId: char.id, pillType, quantity: 1 })
  return { success: true, message: '炼丹成功！' }
})
