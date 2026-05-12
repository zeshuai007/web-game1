import { configShopItems } from '../../db/schema'

export default defineEventHandler(async () => {
  const db = useDB()
  const rows = await db.select().from(configShopItems).orderBy(configShopItems.sortOrder)
  const items = rows.map(r => ({ id: r.itemId, name: r.name, type: r.itemType, description: r.description, price: r.price }))
  return { items }
})
