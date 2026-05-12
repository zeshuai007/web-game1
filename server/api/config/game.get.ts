import { sql } from 'drizzle-orm'
import { configRealms, configShopItems, configForgeRecipes, configAlchemyRecipes, configAchievementDefs, configMaterialNames } from '../../db/schema'

export default defineEventHandler(async () => {
  const db = useDB()

  // Auto-seed if config tables are empty (fresh database)
  const [result] = await db.select({ count: sql`count(*)` }).from(configRealms)
  if (parseInt(String(result?.count || '0')) === 0) {
    const { seedConfig } = await import('../../db/seed')
    await seedConfig(db)
  }

  const [realms, shopItems, forgeRecipes, alchemyRecipes, achievementDefs, materialNames] = await Promise.all([
    db.select().from(configRealms).orderBy(configRealms.sortOrder),
    db.select().from(configShopItems).orderBy(configShopItems.sortOrder),
    db.select().from(configForgeRecipes).orderBy(configForgeRecipes.sortOrder),
    db.select().from(configAlchemyRecipes).orderBy(configAlchemyRecipes.sortOrder),
    db.select().from(configAchievementDefs).orderBy(configAchievementDefs.sortOrder),
    db.select().from(configMaterialNames).orderBy(configMaterialNames.sortOrder),
  ])

  return {
    realms: realms.map(r => ({ ...r, lingqiCap: parseFloat(r.lingqiCap), lingshiRate: parseFloat(r.lingshiRate), lingqiRate: parseFloat(r.lingqiRate), breakthroughChance: parseFloat(r.breakthroughChance) })),
    shopItems,
    forgeRecipes: forgeRecipes.map(r => ({ ...r, materials: JSON.parse(r.materialsJson) })),
    alchemyRecipes: alchemyRecipes.map(r => ({ ...r, materials: JSON.parse(r.materialsJson) })),
    achievementDefs,
    materialNames,
  }
})
