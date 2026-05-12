import { eq, and } from 'drizzle-orm'
import { characters, inventory } from '../../db/schema'

const shopPrices: Record<string, number> = {
  youhun_cao: 10,
  ningxue_hua: 15,
  hansui_ye: 25,
  longxian_guo: 100,
  wannian_lingzhi: 500,
  qicai_xuelian: 2000,
}

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const body = await readBody(event)
  const { itemId, quantity = 1 } = body || {}

  if (!itemId || !shopPrices[itemId]) {
    throw createError({ statusCode: 400, message: '无效的商品' })
  }

  const price = shopPrices[itemId] * quantity
  const db = useDB()

  const char = await useCharacter(event)

  if (parseFloat(char.lingshi) < price) {
    throw createError({ statusCode: 400, message: '灵石不足' })
  }

  await db.update(characters)
    .set({ lingshi: String(parseFloat(char.lingshi) - price), updatedAt: new Date() })
    .where(eq(characters.id, char.id))

  // Add to inventory
  const [existing] = await db.select()
    .from(inventory)
    .where(and(
      eq(inventory.characterId, char.id),
      eq(inventory.itemId, itemId),
    ))

  if (existing) {
    await db.update(inventory)
      .set({ quantity: existing.quantity + quantity, updatedAt: new Date() })
      .where(eq(inventory.id, existing.id))
  } else {
    await db.insert(inventory).values({
      characterId: char.id,
      itemType: 'material',
      itemId,
      quantity,
    })
  }

  return { success: true, message: `购买成功，获得 ${quantity} 个` }
})
