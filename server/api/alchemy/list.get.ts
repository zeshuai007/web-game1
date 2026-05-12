import { configAlchemyRecipes } from '../../db/schema'

export default defineEventHandler(async () => {
  const db = useDB()
  const rows = await db.select().from(configAlchemyRecipes).orderBy(configAlchemyRecipes.sortOrder)
  const recipes = rows.map(r => ({ id: r.pillId, name: r.name, type: r.type, materials: JSON.parse(r.materialsJson), cost: r.cost, effect: r.effect }))
  return { recipes }
})
