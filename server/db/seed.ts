import { configRealms, configShopItems, configForgeRecipes, configAlchemyRecipes, configAchievementDefs, configMaterialNames, configAdventureEvents, configClanLevels, configClanDailyTasks, configQuality, realmEnum } from './schema'

export const realmSeedData: Array<{ key: string; label: string; lingqiCap: number; lingqiRate: number; lingshiRate: number; breakthroughChance: number; maxLayer: number; progressRetainRate: number | null; pityChanceStep: number | null; pityChanceMax: number | null }> = [
    { key: 'condensing_qi',      label: '凝气期', lingqiCap: 150,  lingqiRate: 90,  lingshiRate: 90,  breakthroughChance: 0.6,  maxLayer: 9, progressRetainRate: 0.5, pityChanceStep: 0.05, pityChanceMax: 0.2 },
    { key: 'foundation',         label: '筑基期', lingqiCap: 450,  lingqiRate: 90,  lingshiRate: 90,  breakthroughChance: 0.5,  maxLayer: 3, progressRetainRate: 0.5, pityChanceStep: 0.05, pityChanceMax: 0.2 },
    { key: 'core_formation',     label: '结丹期', lingqiCap: 20000,  lingqiRate: 80,  lingshiRate: 80,  breakthroughChance: 0.3,  maxLayer: 3, progressRetainRate: null, pityChanceStep: null, pityChanceMax: null },
    { key: 'nascent_soul',       label: '元婴期', lingqiCap: 80000,  lingqiRate: 200, lingshiRate: 200, breakthroughChance: 0.25, maxLayer: 3, progressRetainRate: null, pityChanceStep: null, pityChanceMax: null },
    { key: 'deity_transformation',  label: '化神期', lingqiCap: 300000, lingqiRate: 500, lingshiRate: 500, breakthroughChance: 0.2,  maxLayer: 3, progressRetainRate: null, pityChanceStep: null, pityChanceMax: null },
    { key: 'nascent_transformation', label: '婴变期', lingqiCap: 1000000, lingqiRate: 1200, lingshiRate: 1200, breakthroughChance: 0.15, maxLayer: 3, progressRetainRate: null, pityChanceStep: null, pityChanceMax: null },
    { key: 'seeking_heaven',     label: '问鼎期', lingqiCap: 5000000, lingqiRate: 3000, lingshiRate: 3000, breakthroughChance: 0,    maxLayer: 3, progressRetainRate: null, pityChanceStep: null, pityChanceMax: null },
  ]

/** 前期境界（凝气/筑基）调优由代码拥有：config 接口读取时自动把漂移的行同步回最新值 */
export const EARLY_STAGE_REALM_KEYS = ['condensing_qi', 'foundation']

export async function seedConfig(db: any) {
  // ─── Realms ───────────────────────────────────────────────────
  const realmData = realmSeedData

  for (const [i, d] of realmData.entries()) {
    await db.insert(configRealms).values({
      key: d.key, label: d.label,
      lingqiCap: String(d.lingqiCap), lingshiRate: String(d.lingshiRate), lingqiRate: String(d.lingqiRate),
      breakthroughChance: String(d.breakthroughChance), maxLayer: d.maxLayer,
      progressRetainRate: d.progressRetainRate != null ? String(d.progressRetainRate) : null,
      pityChanceStep: d.pityChanceStep != null ? String(d.pityChanceStep) : null,
      pityChanceMax: d.pityChanceMax != null ? String(d.pityChanceMax) : null,
      sortOrder: i,
    }).onConflictDoUpdate({
      target: configRealms.key,
      set: {
        label: d.label, lingqiCap: String(d.lingqiCap),
        lingshiRate: String(d.lingshiRate), lingqiRate: String(d.lingqiRate),
        breakthroughChance: String(d.breakthroughChance), maxLayer: d.maxLayer,
        progressRetainRate: d.progressRetainRate != null ? String(d.progressRetainRate) : null,
        pityChanceStep: d.pityChanceStep != null ? String(d.pityChanceStep) : null,
        pityChanceMax: d.pityChanceMax != null ? String(d.pityChanceMax) : null,
        sortOrder: i,
      },
    })
  }

  // ─── Shop items ───────────────────────────────────────────────
  const shopData: Array<{ id: string; name: string; price: number }> = [
    { id: 'youhun_cao', name: '幽魂草', price: 10 },
    { id: 'ningxue_hua', name: '凝血花', price: 15 },
    { id: 'hansui_ye', name: '寒髓叶', price: 25 },
    { id: 'longxian_guo', name: '龙涎果', price: 100 },
    { id: 'wannian_lingzhi', name: '万年灵芝', price: 500 },
    { id: 'qicai_xuelian', name: '七彩雪莲', price: 2000 },
  ]

  for (const [i, item] of shopData.entries()) {
    await db.insert(configShopItems).values({
      itemId: item.id, name: item.name, description: '', price: item.price, itemType: 'material', sortOrder: i,
    }).onConflictDoNothing()
  }

  // ─── Forge recipes ────────────────────────────────────────────
  const forgeData: Array<{ id: string; name: string; slot: string; materials: { id: string; qty: number }[]; cost: number }> = [
    { id: 'wooden_sword', name: '木剑', slot: 'weapon', materials: [{ id: 'youhun_cao', qty: 3 }], cost: 50 },
    { id: 'bronze_armor', name: '青铜甲', slot: 'armor', materials: [{ id: 'ningxue_hua', qty: 3 }], cost: 80 },
    { id: 'jade_pendant', name: '玉佩', slot: 'accessory', materials: [{ id: 'hansui_ye', qty: 3 }], cost: 100 },
    { id: 'spirit_circlet', name: '灵环', slot: 'artifact', materials: [{ id: 'longxian_guo', qty: 2 }, { id: 'wannian_lingzhi', qty: 1 }], cost: 500 },
  ]

  for (const [i, r] of forgeData.entries()) {
    await db.insert(configForgeRecipes).values({
      recipeId: r.id, name: r.name, slot: r.slot,
      materialsJson: JSON.stringify(r.materials), cost: r.cost, sortOrder: i,
    }).onConflictDoNothing()
  }

  // ─── Alchemy recipes ──────────────────────────────────────────
  const alchemyData: Array<{ id: string; name: string; type: string; materials: { id: string; quantity: number }[]; cost: number; effect: string }> = [
    { id: 'peiyuan_dan', name: '培元丹', type: 'cultivation', materials: [{ id: 'youhun_cao', quantity: 2 }, { id: 'ningxue_hua', quantity: 1 }], cost: 50, effect: '修炼速度 +20%' },
    { id: 'qihuang_dan', name: '岐黄丹', type: 'cultivation', materials: [{ id: 'youhun_cao', quantity: 3 }, { id: 'hansui_ye', quantity: 2 }], cost: 200, effect: '修炼速度 +25%' },
    { id: 'qianji_dan', name: '千机丹', type: 'cultivation', materials: [{ id: 'ningxue_hua', quantity: 3 }, { id: 'hansui_ye', quantity: 3 }], cost: 800, effect: '修炼速度 +30%' },
    { id: 'taiyi_dan', name: '太乙丹', type: 'cultivation', materials: [{ id: 'longxian_guo', quantity: 2 }, { id: 'hansui_ye', quantity: 4 }], cost: 3000, effect: '修炼速度 +35%' },
    { id: 'tianyun_dan', name: '天韵丹', type: 'cultivation', materials: [{ id: 'longxian_guo', quantity: 3 }, { id: 'wannian_lingzhi', quantity: 2 }], cost: 10000, effect: '修炼速度 +40%' },
    { id: 'xuanyuan_dan', name: '玄元丹', type: 'cultivation', materials: [{ id: 'wannian_lingzhi', quantity: 3 }, { id: 'qicai_xuelian', quantity: 2 }], cost: 50000, effect: '修炼速度 +45%' },
    { id: 'wendao_dan', name: '问道丹', type: 'cultivation', materials: [{ id: 'qicai_xuelian', quantity: 4 }, { id: 'wannian_lingzhi', quantity: 4 }], cost: 200000, effect: '修炼速度 +50%' },
    { id: 'zhuji_dan', name: '筑基丹', type: 'breakthrough', materials: [{ id: 'youhun_cao', quantity: 3 }, { id: 'ningxue_hua', quantity: 2 }], cost: 100, effect: '突破概率 +20%' },
    { id: 'tianli_dan', name: '天离丹', type: 'breakthrough', materials: [{ id: 'ningxue_hua', quantity: 4 }, { id: 'longxian_guo', quantity: 1 }], cost: 500, effect: '突破概率 +20%' },
    { id: 'qingyun_dan', name: '青云丹', type: 'breakthrough', materials: [{ id: 'longxian_guo', quantity: 2 }, { id: 'hansui_ye', quantity: 3 }], cost: 2000, effect: '突破概率 +20%' },
    { id: 'huashen_dan', name: '化神丹', type: 'breakthrough', materials: [{ id: 'longxian_guo', quantity: 3 }, { id: 'wannian_lingzhi', quantity: 1 }], cost: 8000, effect: '突破概率 +20%' },
    { id: 'yingbian_dan', name: '婴变丹', type: 'breakthrough', materials: [{ id: 'wannian_lingzhi', quantity: 2 }, { id: 'qicai_xuelian', quantity: 1 }], cost: 30000, effect: '突破概率 +20%' },
    { id: 'wending_dan', name: '问鼎丹', type: 'breakthrough', materials: [{ id: 'qicai_xuelian', quantity: 3 }, { id: 'wannian_lingzhi', quantity: 3 }], cost: 100000, effect: '突破概率 +20%' },
  ]

  for (const [i, r] of alchemyData.entries()) {
    await db.insert(configAlchemyRecipes).values({
      pillId: r.id, name: r.name, type: r.type,
      materialsJson: JSON.stringify(r.materials), cost: r.cost, effect: r.effect, sortOrder: i,
    }).onConflictDoNothing()
  }

  // ─── Achievement definitions ───────────────────────────────────
  const achData: Array<{ key: string; category: string; name: string; description: string; conditionType: string; conditionValue: number; rewardType: string; rewardValue: number; sortOrder: number; materialRewardsJson?: string }> = [
    { key: 'to_foundation', category: 'realm', name: '初入修仙', description: '突破至筑基期', conditionType: 'realm', conditionValue: 1, rewardType: 'lingshi+rate', rewardValue: 500, sortOrder: 1 },
    { key: 'to_core_formation', category: 'realm', name: '丹道初成', description: '突破至结丹期', conditionType: 'realm', conditionValue: 2, rewardType: 'lingshi+rate', rewardValue: 1500, sortOrder: 2 },
    { key: 'to_nascent_soul', category: 'realm', name: '元婴出窍', description: '突破至元婴期', conditionType: 'realm', conditionValue: 3, rewardType: 'lingshi+rate', rewardValue: 5000, sortOrder: 3 },
    { key: 'to_deity', category: 'realm', name: '元神大成', description: '突破至化神期', conditionType: 'realm', conditionValue: 4, rewardType: 'lingshi+rate', rewardValue: 15000, sortOrder: 4 },
    { key: 'to_nascent_trans', category: 'realm', name: '仙体蜕变', description: '突破至婴变期', conditionType: 'realm', conditionValue: 5, rewardType: 'lingshi+rate', rewardValue: 50000, sortOrder: 5 },
    { key: 'to_seeking_heaven', category: 'realm', name: '问鼎大道', description: '突破至问鼎期', conditionType: 'realm', conditionValue: 6, rewardType: 'lingshi+rate', rewardValue: 200000, sortOrder: 6 },
    { key: 'craft_10', category: 'alchemy', name: '初学炼丹', description: '炼制丹药 10 次', conditionType: 'alchemy_count', conditionValue: 10, rewardType: 'lingshi', rewardValue: 100, sortOrder: 7 },
    { key: 'craft_50', category: 'alchemy', name: '熟练丹师', description: '炼制丹药 50 次', conditionType: 'alchemy_count', conditionValue: 50, rewardType: 'lingshi', rewardValue: 500, sortOrder: 8, materialRewardsJson: JSON.stringify([{ id: 'longxian_guo', qty: 2 }]) },
    { key: 'craft_200', category: 'alchemy', name: '炼丹大师', description: '炼制丹药 200 次', conditionType: 'alchemy_count', conditionValue: 200, rewardType: 'lingshi', rewardValue: 2000, sortOrder: 9, materialRewardsJson: JSON.stringify([{ id: 'wannian_lingzhi', qty: 2 }]) },
    { key: 'craft_500', category: 'alchemy', name: '丹道宗师', description: '炼制丹药 500 次', conditionType: 'alchemy_count', conditionValue: 500, rewardType: 'lingshi', rewardValue: 10000, sortOrder: 10, materialRewardsJson: JSON.stringify([{ id: 'qicai_xuelian', qty: 2 }]) },
    { key: 'friends_3', category: 'social', name: '以武会友', description: '拥有 3 位好友', conditionType: 'friend_count', conditionValue: 3, rewardType: 'lingshi', rewardValue: 100, sortOrder: 11 },
    { key: 'friends_10', category: 'social', name: '广结善缘', description: '拥有 10 位好友', conditionType: 'friend_count', conditionValue: 10, rewardType: 'lingshi', rewardValue: 500, sortOrder: 12 },
    { key: 'friends_30', category: 'social', name: '天下皆友', description: '拥有 30 位好友', conditionType: 'friend_count', conditionValue: 30, rewardType: 'lingshi', rewardValue: 3000, sortOrder: 13 },
    { key: 'dao_1', category: 'social', name: '初次论道', description: '论道 1 次', conditionType: 'dao_count', conditionValue: 1, rewardType: 'lingshi', rewardValue: 50, sortOrder: 14 },
    { key: 'dao_50', category: 'social', name: '谈经论道', description: '论道 50 次', conditionType: 'dao_count', conditionValue: 50, rewardType: 'lingshi', rewardValue: 500, sortOrder: 15 },
    { key: 'dao_200', category: 'social', name: '大道争鸣', description: '论道 200 次', conditionType: 'dao_count', conditionValue: 200, rewardType: 'lingshi', rewardValue: 3000, sortOrder: 16 },
    { key: 'forge_5', category: 'forge', name: '初涉锻造', description: '锻造装备 5 次', conditionType: 'forge_count', conditionValue: 5, rewardType: 'lingshi', rewardValue: 100, sortOrder: 17 },
    { key: 'forge_30', category: 'forge', name: '铸造师', description: '锻造装备 30 次', conditionType: 'forge_count', conditionValue: 30, rewardType: 'lingshi', rewardValue: 500, sortOrder: 18 },
    { key: 'forge_100', category: 'forge', name: '炼器大师', description: '锻造装备 100 次', conditionType: 'forge_count', conditionValue: 100, rewardType: 'lingshi', rewardValue: 2000, sortOrder: 19 },
    { key: 'forge_300', category: 'forge', name: '神匠', description: '锻造装备 300 次', conditionType: 'forge_count', conditionValue: 300, rewardType: 'lingshi', rewardValue: 10000, sortOrder: 20 },
    { key: 'quality_lingqi', category: 'forge', name: '灵光一现', description: '锻造出灵器品质装备', conditionType: 'equip_quality', conditionValue: 3, rewardType: 'lingshi', rewardValue: 500, sortOrder: 21 },
    { key: 'quality_xianqi', category: 'forge', name: '仙器问世', description: '锻造出仙器品质装备', conditionType: 'equip_quality', conditionValue: 4, rewardType: 'lingshi', rewardValue: 5000, sortOrder: 22 },
  ]

  for (const [i, a] of achData.entries()) {
    await db.insert(configAchievementDefs).values({
      key: a.key, category: a.category, name: a.name, description: a.description,
      conditionType: a.conditionType, conditionValue: a.conditionValue,
      rewardType: a.rewardType, rewardValue: a.rewardValue, materialRewardsJson: a.materialRewardsJson ?? null, sortOrder: a.sortOrder,
    }).onConflictDoNothing()
  }

  // ─── Material names ───────────────────────────────────────────
  const matData: Array<{ id: string; name: string }> = [
    { id: 'youhun_cao', name: '幽魂草' },
    { id: 'ningxue_hua', name: '凝血花' },
    { id: 'hansui_ye', name: '寒髓叶' },
    { id: 'longxian_guo', name: '龙涎果' },
    { id: 'wannian_lingzhi', name: '万年灵芝' },
    { id: 'qicai_xuelian', name: '七彩雪莲' },
  ]

  for (const [i, m] of matData.entries()) {
    await db.insert(configMaterialNames).values({ itemId: m.id, name: m.name, sortOrder: i }).onConflictDoNothing()
  }

  // ─── Adventure events ─────────────────────────────────────────
  const advData: Array<{ type: string; title: string; description: string; choices: { label: string; desc: string }[]; rewards: { type: string; value: number }[]; baseChance: number }> = [
    { type: 'spirit_herb', title: '灵草现世', description: '你在修炼中感应到附近有珍贵灵草的气息。', choices: [{ label: '仔细搜索', desc: '花费时间寻找' }, { label: '粗略采集', desc: '快速采集' }], rewards: [{ type: 'material_youhun_cao', value: 3 }, { type: 'material_ningxue_hua', value: 2 }], baseChance: 0.3 },
    { type: 'beast_attack', title: '妖兽袭击', description: '一头妖兽闯入你的修炼之地！', choices: [{ label: '正面迎战', desc: '消耗 50 灵气' }, { label: '避其锋芒', desc: '保全灵气' }], rewards: [{ type: 'lingshi', value: 50 }], baseChance: 0.25 },
    { type: 'mysterious_cave', title: '神秘洞府', description: '发现一处隐藏的洞府。', choices: [{ label: '探索洞府', desc: '消耗 100 灵石' }, { label: '保存实力', desc: '日后再说' }], rewards: [{ type: 'lingshi', value: 300 }], baseChance: 0.15 },
    { type: 'heavenly_blessing', title: '天降机缘', description: '一道灵光从天而降！', choices: [{ label: '全力吸收', desc: '吸收全部灵气' }], rewards: [{ type: 'lingqi', value: 200 }], baseChance: 0.2 },
    { type: 'heart_demon', title: '心魔试炼', description: '心魔悄然来袭。', choices: [{ label: '直面心魔', desc: '下次突破概率提升' }, { label: '固守本心', desc: '巩固修为' }], rewards: [{ type: 'breakthrough_bonus', value: 0.1 }], baseChance: 0.1 },
  ]

  for (const [i, e] of advData.entries()) {
    await db.insert(configAdventureEvents).values({
      eventType: e.type, title: e.title, description: e.description,
      choicesJson: JSON.stringify(e.choices), rewardsJson: JSON.stringify(e.rewards),
      baseChance: String(e.baseChance), sortOrder: i,
    }).onConflictDoNothing()
  }

  // ─── Clan levels ──────────────────────────────────────────────
  const clanLevelData: Array<{ level: number; expRequired: number; bonusRate: number }> = [
    { level: 1, expRequired: 0, bonusRate: 0 },
    { level: 2, expRequired: 100, bonusRate: 0.02 },
    { level: 3, expRequired: 300, bonusRate: 0.04 },
    { level: 4, expRequired: 600, bonusRate: 0.06 },
    { level: 5, expRequired: 1000, bonusRate: 0.08 },
    { level: 6, expRequired: 1500, bonusRate: 0.10 },
    { level: 7, expRequired: 2200, bonusRate: 0.12 },
    { level: 8, expRequired: 3000, bonusRate: 0.14 },
    { level: 9, expRequired: 4000, bonusRate: 0.16 },
    { level: 10, expRequired: 5000, bonusRate: 0.18 },
  ]

  for (const d of clanLevelData) {
    await db.insert(configClanLevels).values({
      level: d.level, expRequired: d.expRequired, bonusRate: String(d.bonusRate),
    }).onConflictDoNothing()
  }

  // ─── Clan daily tasks ─────────────────────────────────────────
  const clanTaskData: Array<{ id: string; taskType: string; title: string; description: string; targetCount: number; rewardExp: number; rewardContribution: number }> = [
    { id: 'collect_herb', taskType: 'collect_herb', title: '采集灵草', description: '收集任意炼丹材料', targetCount: 3, rewardExp: 10, rewardContribution: 10 },
    { id: 'gain_lingqi', taskType: 'gain_lingqi', title: '勤修苦练', description: '获得灵气', targetCount: 500, rewardExp: 15, rewardContribution: 15 },
    { id: 'dao_with_member', taskType: 'dao_with_member', title: '宗门论道', description: '与宗门成员论道', targetCount: 1, rewardExp: 20, rewardContribution: 20 },
    { id: 'forge_item', taskType: 'forge_item', title: '锻造装备', description: '锻造任意装备', targetCount: 1, rewardExp: 25, rewardContribution: 25 },
  ]

  for (const [i, t] of clanTaskData.entries()) {
    await db.insert(configClanDailyTasks).values({ ...t, sortOrder: i }).onConflictDoNothing()
  }

  // ─── Quality tiers ────────────────────────────────────────────
  const qualityData: Array<{ quality: number; name: string; color: string; rollThreshold: number; bonusRate: number }> = [
    { quality: 0, name: '凡器', color: 'text-ink-300', rollThreshold: 0.50, bonusRate: 0.02 },
    { quality: 1, name: '法器', color: 'text-jade-400', rollThreshold: 0.80, bonusRate: 0.05 },
    { quality: 2, name: '宝器', color: 'text-blue-400', rollThreshold: 0.95, bonusRate: 0.10 },
    { quality: 3, name: '灵器', color: 'text-purple-400', rollThreshold: 0.99, bonusRate: 0.20 },
    { quality: 4, name: '仙器', color: 'text-gold-400', rollThreshold: 1.00, bonusRate: 0.40 },
  ]

  for (const d of qualityData) {
    await db.insert(configQuality).values({
      quality: d.quality, name: d.name, color: d.color,
      rollThreshold: String(d.rollThreshold), bonusRate: String(d.bonusRate),
    }).onConflictDoNothing()
  }
}
