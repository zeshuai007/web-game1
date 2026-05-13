import { sql } from 'drizzle-orm'
import { configRealms, configShopItems, configForgeRecipes, configAlchemyRecipes, configAchievementDefs, configMaterialNames } from '../../db/schema'
import { realmConfigs, breakthroughBaseChance } from '../../utils/game-engine'

export default defineEventHandler(async () => {
  const db = useDB()

  // Auto-seed if config tables are empty (fresh database)
  const [result] = await db.select({ count: sql`count(*)` }).from(configRealms)
  if (parseInt(String(result?.count || '0')) === 0 || await shouldSyncRealmConfig(db)) {
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
    realms: realms.map(r => ({
      ...r,
      lingqiCap: parseFloat(r.lingqiCap),
      lingshiRate: parseFloat(r.lingshiRate),
      lingqiRate: parseFloat(r.lingqiRate),
      breakthroughChance: parseFloat(r.breakthroughChance),
      progressRetainRate: r.progressRetainRate == null ? null : parseFloat(r.progressRetainRate),
      pityChanceStep: r.pityChanceStep == null ? null : parseFloat(r.pityChanceStep),
      pityChanceMax: r.pityChanceMax == null ? null : parseFloat(r.pityChanceMax),
    })),
    shopItems,
    forgeRecipes: forgeRecipes.map(r => ({ ...r, materials: JSON.parse(r.materialsJson) })),
    alchemyRecipes: alchemyRecipes.map(r => ({ ...r, materials: JSON.parse(r.materialsJson) })),
    achievementDefs,
    materialNames,
  }
})

async function shouldSyncRealmConfig(db: ReturnType<typeof useDB>) {
  const rows = await db.select().from(configRealms)
  for (const row of rows) {
    const expected = realmConfigs[row.key as keyof typeof realmConfigs]
    if (!expected) continue

    const nextChanceKey = Object.keys(breakthroughBaseChance).find((key) => key.startsWith(`${row.key}→`))
    const expectedChance = nextChanceKey ? breakthroughBaseChance[nextChanceKey] : 0

    if (
      parseFloat(row.lingqiCap) !== expected.lingqiCap ||
      parseFloat(row.lingshiRate) !== expected.lingshiRate ||
      parseFloat(row.lingqiRate) !== expected.lingqiRate ||
      parseFloat(row.breakthroughChance) !== expectedChance ||
      normalizeDecimal(row.progressRetainRate) !== normalizeNumber(expected.progressRetainRate) ||
      normalizeDecimal(row.pityChanceStep) !== normalizeNumber(expected.pityChanceStep) ||
      normalizeDecimal(row.pityChanceMax) !== normalizeNumber(expected.pityChanceMax)
    ) {
      return true
    }
  }
  return false
}

function normalizeDecimal(value: string | null) {
  return value == null ? null : parseFloat(value)
}

function normalizeNumber(value: number | undefined) {
  return value == null ? null : value
}
