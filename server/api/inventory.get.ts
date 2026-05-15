import { eq } from 'drizzle-orm'
import { characters, inventory, configMaterialNames, configAlchemyRecipes } from '../db/schema'

export default defineEventHandler(async (event) => {
  const db = useDB()

  const char = await useCharacter(event)

  // Fetch name mappings from DB
  const [matRows, pillRows] = await Promise.all([
    db.select().from(configMaterialNames),
    db.select().from(configAlchemyRecipes),
  ])
  const materialNameMap: Record<string, string> = {}
  for (const row of matRows) materialNameMap[row.itemId] = row.name
  const pillNameMap: Record<string, string> = {}
  for (const row of pillRows) pillNameMap[row.pillId] = row.name

  const items = await db.select()
    .from(inventory)
    .where(eq(inventory.characterId, char.id))

  const mapped = items.map(item => ({
    ...item,
    name: item.itemType === 'pill'
      ? (pillNameMap[item.itemId] || item.itemId)
      : (materialNameMap[item.itemId] || item.itemId),
  }))

  return { items: mapped }
})