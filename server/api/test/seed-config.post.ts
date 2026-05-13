import { configRealms, configShopItems, configForgeRecipes, configAlchemyRecipes, configAchievementDefs, configMaterialNames } from '../../db/schema'
import { realmConfigs, breakthroughBaseChance, getMaxLayer, forgeRecipes, alchemyRecipes, materialNames, realmEnum } from '../../utils/game-engine'
import { achievementDefs } from '../../utils/achievement-engine'

export default defineEventHandler(async () => {
  const db = useDB()

  // Realms
  for (const [i, key] of realmEnum.entries()) {
    const cfg = realmConfigs[key]
    const nextKey = realmEnum[i + 1]
    const chanceStr = nextKey ? String(breakthroughBaseChance[`${key}→${nextKey}`] || '0') : '0'
    await db.insert(configRealms).values({
      key, label: cfg.label, lingqiCap: String(cfg.lingqiCap),
      lingshiRate: String(cfg.lingshiRate), lingqiRate: String(cfg.lingqiRate),
      breakthroughChance: chanceStr, maxLayer: getMaxLayer(key),
      progressRetainRate: cfg.progressRetainRate != null ? String(cfg.progressRetainRate) : null,
      pityChanceStep: cfg.pityChanceStep != null ? String(cfg.pityChanceStep) : null,
      pityChanceMax: cfg.pityChanceMax != null ? String(cfg.pityChanceMax) : null,
      sortOrder: i,
    }).onConflictDoNothing()
  }

  const shopData = [
    { id: 'youhun_cao', p: 10 }, { id: 'ningxue_hua', p: 15 }, { id: 'hansui_ye', p: 25 },
    { id: 'longxian_guo', p: 100 }, { id: 'wannian_lingzhi', p: 500 }, { id: 'qicai_xuelian', p: 2000 },
  ]
  for (const [i, item] of shopData.entries()) {
    await db.insert(configShopItems).values({
      itemId: item.id, name: materialNames[item.id] || item.id,
      description: '', price: item.p, itemType: 'material', sortOrder: i,
    }).onConflictDoNothing()
  }

  for (const [i, r] of forgeRecipes.entries()) {
    await db.insert(configForgeRecipes).values({
      recipeId: r.id, name: r.name, slot: r.slot,
      materialsJson: JSON.stringify(r.materials), cost: r.cost, sortOrder: i,
    }).onConflictDoNothing()
  }

  for (const [i, r] of alchemyRecipes.entries()) {
    await db.insert(configAlchemyRecipes).values({
      pillId: r.id, name: r.name, type: r.type,
      materialsJson: JSON.stringify(r.materials), cost: r.cost, effect: r.effect, sortOrder: i,
    }).onConflictDoNothing()
  }

  for (const [i, a] of achievementDefs.entries()) {
    await db.insert(configAchievementDefs).values({
      key: a.key, category: a.category, name: a.name, description: a.description,
      conditionType: a.conditionType, conditionValue: a.conditionValue,
      rewardType: a.rewardType, rewardValue: a.rewardValue, sortOrder: a.sortOrder,
    }).onConflictDoNothing()
  }

  for (const [i, [key, name]] of Object.entries(materialNames).entries()) {
    await db.insert(configMaterialNames).values({ itemId: key, name, sortOrder: i }).onConflictDoNothing()
  }

  return { success: true }
})
