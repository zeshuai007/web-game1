import { configRealms, configShopItems, configForgeRecipes, configAlchemyRecipes, configAchievementDefs, configMaterialNames, configAdventureEvents, configClanLevels, configClanDailyTasks, configQuality } from '../../db/schema'
import { isConfigEmpty, invalidateConfigCache } from '../../utils/config'
import { realmSeedData, EARLY_STAGE_REALM_KEYS } from '../../db/seed'

/** 前期境界（凝气/筑基）调优由代码拥有：把漂移的行强制同步回最新值 */
async function syncEarlyStageTuning(db: any) {
  for (const d of realmSeedData.filter(r => EARLY_STAGE_REALM_KEYS.includes(r.key))) {
    await db.insert(configRealms).values({
      key: d.key, label: d.label,
      lingqiCap: String(d.lingqiCap), lingshiRate: String(d.lingshiRate), lingqiRate: String(d.lingqiRate),
      breakthroughChance: String(d.breakthroughChance), maxLayer: d.maxLayer,
      progressRetainRate: d.progressRetainRate != null ? String(d.progressRetainRate) : null,
      pityChanceStep: d.pityChanceStep != null ? String(d.pityChanceStep) : null,
      pityChanceMax: d.pityChanceMax != null ? String(d.pityChanceMax) : null,
    }).onConflictDoUpdate({
      target: configRealms.key,
      set: {
        label: d.label,
        lingqiCap: String(d.lingqiCap), lingshiRate: String(d.lingshiRate), lingqiRate: String(d.lingqiRate),
        breakthroughChance: String(d.breakthroughChance), maxLayer: d.maxLayer,
        progressRetainRate: d.progressRetainRate != null ? String(d.progressRetainRate) : null,
        pityChanceStep: d.pityChanceStep != null ? String(d.pityChanceStep) : null,
        pityChanceMax: d.pityChanceMax != null ? String(d.pityChanceMax) : null,
      },
    })
  }
}

export default defineEventHandler(async () => {
  const db = useDB()

  // Auto-seed if config tables are empty (fresh database)
  if (await isConfigEmpty(db)) {
    const { seedConfig } = await import('../../db/seed')
    await seedConfig(db)
  }

  await syncEarlyStageTuning(db)
  // 前期调优刚被强制同步，立即失效配置缓存，其他端点读到最新值
  invalidateConfigCache()

  const [realms, shopItems, forgeRecipes, alchemyRecipes, achievementDefs, materialNames, adventureEvents, clanLevels, clanDailyTasks, qualityTiers] = await Promise.all([
    db.select().from(configRealms).orderBy(configRealms.sortOrder),
    db.select().from(configShopItems).orderBy(configShopItems.sortOrder),
    db.select().from(configForgeRecipes).orderBy(configForgeRecipes.sortOrder),
    db.select().from(configAlchemyRecipes).orderBy(configAlchemyRecipes.sortOrder),
    db.select().from(configAchievementDefs).orderBy(configAchievementDefs.sortOrder),
    db.select().from(configMaterialNames).orderBy(configMaterialNames.sortOrder),
    db.select().from(configAdventureEvents).orderBy(configAdventureEvents.sortOrder),
    db.select().from(configClanLevels).orderBy(configClanLevels.level),
    db.select().from(configClanDailyTasks).orderBy(configClanDailyTasks.sortOrder),
    db.select().from(configQuality).orderBy(configQuality.quality),
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
    adventureEvents: adventureEvents.map(e => ({
      ...e,
      choices: JSON.parse(e.choicesJson),
      rewards: JSON.parse(e.rewardsJson),
    })),
    clanLevels: clanLevels.map(l => ({ ...l, bonusRate: parseFloat(l.bonusRate) })),
    clanDailyTasks,
    qualityTiers: qualityTiers.map(q => ({ ...q, rollThreshold: parseFloat(q.rollThreshold), bonusRate: parseFloat(q.bonusRate) })),
    // UI display helpers (derived from quality tiers)
    slotNames: { weapon: '武器', armor: '护甲', accessory: '饰品', artifact: '法宝' },
  }
})