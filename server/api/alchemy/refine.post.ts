import { eq, and } from 'drizzle-orm'
import { characters, inventory, alchemyRecords, pillTypeEnum } from '../../db/schema'
import { fireAchievementCheck } from '../../utils/achievement-engine'

const recipeCosts: Record<string, { materials: Record<string, number>; cost: number }> = {
  peiyuan_dan: { materials: { youhun_cao: 2, ningxue_hua: 1 }, cost: 50 },
  qihuang_dan: { materials: { youhun_cao: 3, hansui_ye: 2 }, cost: 200 },
  qianji_dan: { materials: { ningxue_hua: 3, hansui_ye: 3 }, cost: 800 },
  taiyi_dan: { materials: { longxian_guo: 2, hansui_ye: 4 }, cost: 3000 },
  tianyun_dan: { materials: { longxian_guo: 3, wannian_lingzhi: 2 }, cost: 10000 },
  xuanyuan_dan: { materials: { wannian_lingzhi: 3, qicai_xuelian: 2 }, cost: 50000 },
  wendao_dan: { materials: { qicai_xuelian: 4, wannian_lingzhi: 4 }, cost: 200000 },
  zhuji_dan: { materials: { youhun_cao: 3, ningxue_hua: 2 }, cost: 100 },
  tianli_dan: { materials: { ningxue_hua: 4, longxian_guo: 1 }, cost: 500 },
  qingyun_dan: { materials: { longxian_guo: 2, hansui_ye: 3 }, cost: 2000 },
  huashen_dan: { materials: { longxian_guo: 3, wannian_lingzhi: 1 }, cost: 8000 },
  yingbian_dan: { materials: { wannian_lingzhi: 2, qicai_xuelian: 1 }, cost: 30000 },
  wending_dan: { materials: { qicai_xuelian: 3, wannian_lingzhi: 3 }, cost: 100000 },
}

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const body = await readBody(event)
  const { pillType } = body || {}

  if (!pillType || !pillTypeEnum.includes(pillType as any)) {
    throw createError({ statusCode: 400, message: '无效的丹药类型' })
  }

  const recipe = recipeCosts[pillType]
  if (!recipe) {
    throw createError({ statusCode: 400, message: '未知的丹方' })
  }

  const db = useDB()

  const [char] = await db.select().from(characters).where(eq(characters.userId, userId))
  if (!char) {
    throw createError({ statusCode: 404, message: '角色不存在' })
  }

  // Check lingshi
  if (parseFloat(char.lingshi) < recipe.cost) {
    throw createError({ statusCode: 400, message: '灵石不足' })
  }

  // Deduct lingshi
  await db.update(characters)
    .set({ lingshi: String(parseFloat(char.lingshi) - recipe.cost), updatedAt: new Date() })
    .where(eq(characters.id, char.id))

  // Check and deduct materials
  for (const [materialId, qty] of Object.entries(recipe.materials)) {
    const [inv] = await db.select()
      .from(inventory)
      .where(and(
        eq(inventory.characterId, char.id),
        eq(inventory.itemId, materialId),
      ))

    if (!inv || inv.quantity < qty) {
      // Refund lingshi
      await db.update(characters)
        .set({ lingshi: String(parseFloat(char.lingshi)), updatedAt: new Date() })
        .where(eq(characters.id, char.id))
      throw createError({ statusCode: 400, message: `材料不足：${materialId}` })
    }

    await db.update(inventory)
      .set({ quantity: inv.quantity - qty, updatedAt: new Date() })
      .where(eq(inventory.id, inv.id))
  }

  // Add pill to inventory
  const [existingPill] = await db.select()
    .from(inventory)
    .where(and(
      eq(inventory.characterId, char.id),
      eq(inventory.itemId, pillType),
      eq(inventory.itemType, 'pill'),
    ))

  if (existingPill) {
    await db.update(inventory)
      .set({ quantity: existingPill.quantity + 1, updatedAt: new Date() })
      .where(eq(inventory.id, existingPill.id))
  } else {
    await db.insert(inventory).values({
      characterId: char.id,
      itemType: 'pill',
      itemId: pillType,
      quantity: 1,
    })
  }

  // Record alchemy
  await db.insert(alchemyRecords).values({
    characterId: char.id,
    pillType,
    quantity: 1,
  })

  fireAchievementCheck(event, 'alchemy')
  return { success: true, message: '炼丹成功！' }
})
