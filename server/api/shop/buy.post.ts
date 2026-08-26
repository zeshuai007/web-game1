import { eq, and } from 'drizzle-orm'
import { characters, inventory, configShopItems } from '../../db/schema'

const MAX_QUANTITY = 999

/**
 * 商店购买（事务化）。
 *
 * 扣款与入包在同一事务中原子提交；行锁串行化防止并发扣款竞态。
 */
export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const body = await readBody(event)
  const { itemId, quantity = 1 } = body || {}

  if (!itemId) throw createError({ statusCode: 400, message: '缺少商品ID' })
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    throw createError({ statusCode: 400, message: `数量无效（1-${MAX_QUANTITY}）` })
  }

  const db = useDB()

  const [shopItem] = await db.select().from(configShopItems).where(eq(configShopItems.itemId, itemId)).limit(1)
  if (!shopItem) throw createError({ statusCode: 400, message: '无效的商品' })

  const price = shopItem.price * quantity

  return db.transaction(async (tx) => {
    const [char] = await tx.select().from(characters)
      .where(eq(characters.userId, userId))
      .for('update')
    if (!char) throw createError({ statusCode: 404, message: '角色不存在' })
    if (parseFloat(char.lingshi) < price) throw createError({ statusCode: 400, message: '灵石不足' })

    const now = new Date()
    await tx.update(characters)
      .set({ lingshi: String(parseFloat(char.lingshi) - price), updatedAt: now })
      .where(eq(characters.id, char.id))

    const [inv] = await tx.select().from(inventory)
      .where(and(eq(inventory.characterId, char.id), eq(inventory.itemId, itemId)))
      .limit(1)

    if (inv) {
      await tx.update(inventory)
        .set({ quantity: inv.quantity + quantity, updatedAt: now })
        .where(eq(inventory.id, inv.id))
    } else {
      await tx.insert(inventory).values({ characterId: char.id, itemType: shopItem.itemType || 'material', itemId, quantity })
    }

    return { success: true, message: `购买成功，获得 ${shopItem.name} ×${quantity}` }
  })
})
