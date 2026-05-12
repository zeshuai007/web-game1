import { configRealms, configShopItems, configForgeRecipes, configAlchemyRecipes, configAchievementDefs, configMaterialNames } from './schema'
import { realmConfigs, breakthroughBaseChance, getMaxLayer, forgeRecipes, alchemyRecipes, achievementDefs, materialNames, realmEnum } from '../utils/game-engine'

const db = useDB()

export async function seedConfig() {
  // Realms
  for (const [i, key] of realmEnum.entries()) {
    const cfg = realmConfigs[key]
    const chanceStr = breakthroughBaseChance[`${key}→${realmEnum[i + 1]}`]
    await db.insert(configRealms).values({
      key, label: cfg.label, lingqiCap: String(cfg.lingqiCap),
      lingshiRate: String(cfg.lingshiRate), lingqiRate: String(cfg.lingqiRate),
      breakthroughChance: String(chanceStr || '0'),
      maxLayer: getMaxLayer(key), sortOrder: i,
    }).onConflictDoNothing()
  }

  // Shop items
  const shopItems = [
    { id: 'youhun_cao', price: 10, desc: '阴属性灵草，低阶丹药辅料' },
    { id: 'ningxue_hua', price: 15, desc: '蕴含血气精华的灵花' },
    { id: 'hansui_ye', price: 25, desc: '冰寒属性灵药，中和丹火' },
    { id: 'longxian_guo', price: 100, desc: '罕见灵果，高阶丹药药引' },
    { id: 'wannian_lingzhi', price: 500, desc: '极品药材，高阶丹药核心药引' },
    { id: 'qicai_xuelian', price: 2000, desc: '传说级药材，顶级丹药所需' },
  ]
  for (const [i, item] of shopItems.entries()) {
    await db.insert(configShopItems).values({
      itemId: item.id, name: materialNames[item.id] || item.id,
      description: item.desc, price: item.price, itemType: 'material', sortOrder: i,
    }).onConflictDoNothing()
  }

  // Forge recipes
  for (const [i, r] of forgeRecipes.entries()) {
    await db.insert(configForgeRecipes).values({
      recipeId: r.id, name: r.name, slot: r.slot,
      materialsJson: JSON.stringify(r.materials), cost: r.cost, sortOrder: i,
    }).onConflictDoNothing()
  }

  // Alchemy recipes
  for (const [i, r] of alchemyRecipes.entries()) {
    await db.insert(configAlchemyRecipes).values({
      pillId: r.id, name: r.name, type: r.type,
      materialsJson: JSON.stringify(r.materials), cost: r.cost, effect: r.effect, sortOrder: i,
    }).onConflictDoNothing()
  }

  // Achievement defs
  for (const [i, a] of achievementDefs.entries()) {
    await db.insert(configAchievementDefs).values({
      key: a.key, category: a.category, name: a.name, description: a.description,
      conditionType: a.conditionType, conditionValue: a.conditionValue,
      rewardType: a.rewardType, rewardValue: a.rewardValue, sortOrder: a.sortOrder,
    }).onConflictDoNothing()
  }

  // Material names
  for (const [i, [key, name]] of Object.entries(materialNames).entries()) {
    await db.insert(configMaterialNames).values({ itemId: key, name, sortOrder: i }).onConflictDoNothing()
  }
}

// Auto-run on import if called directly
seedConfig().then(() => console.log('Seed complete')).catch(e => console.error('Seed error:', e))
