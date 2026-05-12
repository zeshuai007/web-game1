import { eq, and } from 'drizzle-orm'
import { characters, inventory, configShopItems } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const body = await readBody(event)
  const { itemId, quantity = 1 } = body || {}

  if (!itemId) throw createError({ statusCode: 400, message: '缺少商品ID' })
  if (quantity < 1) throw createError({ statusCode: 400, message: '数量无效' })

  const db = useDB()

  const [shopItem] = await db.select().from(configShopItems).where(eq(configShopItems.itemId, itemId)).limit(1)
  if (!shopItem) throw createError({ statusCode: 400, message: '无效的商品' })

  const price = shopItem.price * quantity

  const char = await useCharacter(event)
  if (parseFloat(char.lingshi) < price) throw createError({ statusCode: 400, message: '灵石不足' })

  await db.update(characters).set({ lingshi: String(parseFloat(char.lingshi) - price) }).where(eq(characters.id, char.id))

  const [inv] = await db.select().from(inventory)
    .where(and(eq(inventory.characterId, char.id), eq(inventory.itemId, itemId)))

  if (inv) {
    await db.update(inventory).set({ quantity: inv.quantity + quantity }).where(eq(inventory.id, inv.id))
  } else {
    await db.insert(inventory).values({ characterId: char.id, itemType: 'material', itemId, quantity })
  }

  return { success: true, message: `购买成功，获得 ${shopItem.name} ×${quantity}` }
})
