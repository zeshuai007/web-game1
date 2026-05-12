import { eq } from 'drizzle-orm'
import { characters, inventory, type PillType } from '../db/schema'
import { pillNames, materialNames } from '../utils/game-engine'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const db = useDB()

  const char = await useCharacter(event)

  const items = await db.select()
    .from(inventory)
    .where(eq(inventory.characterId, char.id))

  const mapped = items.map(item => ({
    ...item,
    name: item.itemType === 'pill'
      ? (pillNames[item.itemId] || item.itemId)
      : (materialNames[item.itemId] || item.itemId),
  }))

  return { items: mapped }
})
