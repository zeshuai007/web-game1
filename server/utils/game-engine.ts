import { characters, realmEnum as realmEnumValues, type Realm, realmLabels } from '../db/schema'

export const realmEnum = realmEnumValues

export interface RealmConfig {
  label: string
  lingqiCap: number
  lingshiRate: number
  lingqiRate: number
}

export const realmConfigs: Record<Realm, RealmConfig> = {
  condensing_qi:      { label: '凝气期', lingqiCap: 1000,  lingshiRate: 10,  lingqiRate: 10 },
  foundation:         { label: '筑基期', lingqiCap: 5000,  lingshiRate: 30,  lingqiRate: 30 },
  core_formation:     { label: '结丹期', lingqiCap: 20000, lingshiRate: 80,  lingqiRate: 80 },
  nascent_soul:       { label: '元婴期', lingqiCap: 80000, lingshiRate: 200, lingqiRate: 200 },
  deity_transformation: { label: '化神期', lingqiCap: 300000, lingshiRate: 500, lingqiRate: 500 },
  nascent_transformation: { label: '婴变期', lingqiCap: 1000000, lingshiRate: 1200, lingqiRate: 1200 },
  seeking_heaven:     { label: '问鼎期', lingqiCap: 5000000, lingshiRate: 3000, lingqiRate: 3000 },
}

export const breakthroughBaseChance: Record<string, number> = {
  'condensing_qi→foundation': 0.5,
  'foundation→core_formation': 0.4,
  'core_formation→nascent_soul': 0.3,
  'nascent_soul→deity_transformation': 0.25,
  'deity_transformation→nascent_transformation': 0.2,
  'nascent_transformation→seeking_heaven': 0.15,
}

export function getMaxLayer(realm: Realm): number {
  return realm === 'condensing_qi' ? 9 : 3
}

export function getNextRealm(current: Realm): Realm | null {
  const idx = realmEnum.indexOf(current)
  if (idx >= realmEnum.length - 1) return null
  return realmEnum[idx + 1]
}

export function isMaxLayer(realm: Realm, layer: number): boolean {
  return layer >= getMaxLayer(realm)
}

function getRealmBoundaryKey(current: Realm): string {
  const next = getNextRealm(current)
  if (!next) return ''
  return `${current}→${next}`
}

export function calcOfflineEarnings(char: typeof characters.$inferSelect, elapsedMinutes: number) {
  const cap = 24 * 60 // 24 hours in minutes
  const effectiveMinutes = Math.min(elapsedMinutes, cap)
  const cfg = realmConfigs[char.realm as Realm]
  const pillMultiplier = 1 // will be enhanced with active pill effects
  const lingqiGain = cfg.lingqiRate * effectiveMinutes * pillMultiplier
  const lingshiGain = cfg.lingshiRate * effectiveMinutes * pillMultiplier
  return { lingqiGain, lingshiGain, effectiveMinutes }
}

export function breakthroughRoll(realm: Realm, hasBreakthroughPill: boolean): boolean {
  const key = getRealmBoundaryKey(realm)
  const base = breakthroughBaseChance[key] ?? 0.15
  const chance = hasBreakthroughPill ? Math.min(base + 0.2, 0.9) : base
  return Math.random() < chance
}

export function getPillCultivationBonus(pillType: string | null): number {
  const bonuses: Record<string, number> = {
    peiyuan_dan: 0.2,
    qihuang_dan: 0.25,
    qianji_dan: 0.3,
    taiyi_dan: 0.35,
    tianyun_dan: 0.4,
    xuanyuan_dan: 0.45,
    wendao_dan: 0.5,
  }
  return pillType ? (bonuses[pillType] ?? 0) : 0
}

export function getPillBreakthroughBonus(pillType: string): number {
  const breakthroughPills = [
    'zhuji_dan', 'tianli_dan', 'qingyun_dan',
    'huashen_dan', 'yingbian_dan', 'wending_dan',
  ]
  return breakthroughPills.includes(pillType) ? 0.2 : 0
}

export const pillNames: Record<string, string> = {
  peiyuan_dan: '培元丹',
  qihuang_dan: '岐黄丹',
  qianji_dan: '千机丹',
  taiyi_dan: '太乙丹',
  tianyun_dan: '天韵丹',
  xuanyuan_dan: '玄元丹',
  wendao_dan: '问道丹',
  zhuji_dan: '筑基丹',
  tianli_dan: '天离丹',
  qingyun_dan: '青云丹',
  huashen_dan: '化神丹',
  yingbian_dan: '婴变丹',
  wending_dan: '问鼎丹',
}

export interface AdventureEvent {
  type: string
  title: string
  description: string
  choices: { label: string; desc: string }[]
  rewards: { type: string; value: number }[]
  baseChance: number // per hour
}

export const adventureEvents: AdventureEvent[] = [
  {
    type: 'spirit_herb',
    title: '灵草现世',
    description: '你在修炼中感应到附近有珍贵灵草的气息，或许能找到一些炼丹材料。',
    choices: [
      { label: '仔细搜索', desc: '花费一些时间寻找灵草' },
      { label: '粗略采集', desc: '快速采集后继续修炼' },
    ],
    rewards: [
      { type: 'material_youhun_cao', value: 3 },
      { type: 'material_ningxue_hua', value: 2 },
    ],
    baseChance: 0.3,
  },
  {
    type: 'beast_attack',
    title: '妖兽袭击',
    description: '一头妖兽闯入你的修炼之地！你需要消耗灵气来击退它。',
    choices: [
      { label: '正面迎战', desc: '消耗 50 灵气击退妖兽，获得灵石' },
      { label: '避其锋芒', desc: '避开战斗，保全灵气' },
    ],
    rewards: [
      { type: 'lingshi', value: 50 },
    ],
    baseChance: 0.25,
  },
  {
    type: 'mysterious_cave',
    title: '神秘洞府',
    description: '你发现一处隐藏的洞府，似乎是一位前辈高人的坐化之地。但需要消耗灵石才能打开禁制。',
    choices: [
      { label: '探索洞府', desc: '消耗 100 灵石探索，可能获得大量机缘' },
      { label: '保存实力', desc: '记下位置，日后再说' },
    ],
    rewards: [
      { type: 'lingshi', value: 300 },
    ],
    baseChance: 0.15,
  },
  {
    type: 'heavenly_blessing',
    title: '天降机缘',
    description: '一道灵光从天而降，直直没入你的天灵盖！你感觉体内灵气暴涨！',
    choices: [
      { label: '全力吸收', desc: '吸收全部灵气' },
    ],
    rewards: [
      { type: 'lingqi', value: 200 },
    ],
    baseChance: 0.2,
  },
  {
    type: 'heart_demon',
    title: '心魔试炼',
    description: '修炼到关键处，心魔悄然来袭。若能克服，突破时将获得裨益。',
    choices: [
      { label: '直面心魔', desc: '克服心魔，下次突破概率提升' },
      { label: '固守本心', desc: '稳扎稳打，巩固修为' },
    ],
    rewards: [
      { type: 'breakthrough_bonus', value: 0.1 },
    ],
    baseChance: 0.1,
  },
]

export function rollAdventureEvent(realm: Realm): AdventureEvent | null {
  const cfg = realmConfigs[realm]
  // Higher realms have higher event chances
  const realmMultiplier = 1 + (realmEnum.indexOf(realm) * 0.2)
  for (const event of adventureEvents) {
    const chance = event.baseChance * realmMultiplier
    if (Math.random() < chance) {
      return event
    }
  }
  return null
}

export const qualityNames = ['凡器', '法器', '宝器', '灵器', '仙器']
export const qualityColors = ['text-ink-300', 'text-jade-400', 'text-blue-400', 'text-purple-400', 'text-gold-400']

export interface AlchemyRecipe {
  id: string
  name: string
  type: 'cultivation' | 'breakthrough'
  realm: string
  materials: { id: string; name: string; quantity: number }[]
  cost: number
  effect: string
}

export const alchemyRecipes: AlchemyRecipe[] = [
  { id: 'peiyuan_dan', name: '培元丹', type: 'cultivation', realm: '凝气期', materials: [{ id: 'youhun_cao', name: '幽魂草', quantity: 2 }, { id: 'ningxue_hua', name: '凝血花', quantity: 1 }], cost: 50, effect: '修炼速度 +20%' },
  { id: 'qihuang_dan', name: '岐黄丹', type: 'cultivation', realm: '筑基期', materials: [{ id: 'youhun_cao', name: '幽魂草', quantity: 3 }, { id: 'hansui_ye', name: '寒髓叶', quantity: 2 }], cost: 200, effect: '修炼速度 +25%' },
  { id: 'qianji_dan', name: '千机丹', type: 'cultivation', realm: '结丹期', materials: [{ id: 'ningxue_hua', name: '凝血花', quantity: 3 }, { id: 'hansui_ye', name: '寒髓叶', quantity: 3 }], cost: 800, effect: '修炼速度 +30%' },
  { id: 'taiyi_dan', name: '太乙丹', type: 'cultivation', realm: '元婴期', materials: [{ id: 'longxian_guo', name: '龙涎果', quantity: 2 }, { id: 'hansui_ye', name: '寒髓叶', quantity: 4 }], cost: 3000, effect: '修炼速度 +35%' },
  { id: 'tianyun_dan', name: '天韵丹', type: 'cultivation', realm: '化神期', materials: [{ id: 'longxian_guo', name: '龙涎果', quantity: 3 }, { id: 'wannian_lingzhi', name: '万年灵芝', quantity: 2 }], cost: 10000, effect: '修炼速度 +40%' },
  { id: 'xuanyuan_dan', name: '玄元丹', type: 'cultivation', realm: '婴变期', materials: [{ id: 'wannian_lingzhi', name: '万年灵芝', quantity: 3 }, { id: 'qicai_xuelian', name: '七彩雪莲', quantity: 2 }], cost: 50000, effect: '修炼速度 +45%' },
  { id: 'wendao_dan', name: '问道丹', type: 'cultivation', realm: '问鼎期', materials: [{ id: 'qicai_xuelian', name: '七彩雪莲', quantity: 4 }, { id: 'wannian_lingzhi', name: '万年灵芝', quantity: 4 }], cost: 200000, effect: '修炼速度 +50%' },
  { id: 'zhuji_dan', name: '筑基丹', type: 'breakthrough', realm: '凝气→筑基', materials: [{ id: 'youhun_cao', name: '幽魂草', quantity: 3 }, { id: 'ningxue_hua', name: '凝血花', quantity: 2 }], cost: 100, effect: '突破概率 +20%' },
  { id: 'tianli_dan', name: '天离丹', type: 'breakthrough', realm: '筑基→结丹', materials: [{ id: 'ningxue_hua', name: '凝血花', quantity: 4 }, { id: 'longxian_guo', name: '龙涎果', quantity: 1 }], cost: 500, effect: '突破概率 +20%' },
  { id: 'qingyun_dan', name: '青云丹', type: 'breakthrough', realm: '结丹→元婴', materials: [{ id: 'longxian_guo', name: '龙涎果', quantity: 2 }, { id: 'hansui_ye', name: '寒髓叶', quantity: 3 }], cost: 2000, effect: '突破概率 +20%' },
  { id: 'huashen_dan', name: '化神丹', type: 'breakthrough', realm: '元婴→化神', materials: [{ id: 'longxian_guo', name: '龙涎果', quantity: 3 }, { id: 'wannian_lingzhi', name: '万年灵芝', quantity: 1 }], cost: 8000, effect: '突破概率 +20%' },
  { id: 'yingbian_dan', name: '婴变丹', type: 'breakthrough', realm: '化神→婴变', materials: [{ id: 'wannian_lingzhi', name: '万年灵芝', quantity: 2 }, { id: 'qicai_xuelian', name: '七彩雪莲', quantity: 1 }], cost: 30000, effect: '突破概率 +20%' },
  { id: 'wending_dan', name: '问鼎丹', type: 'breakthrough', realm: '婴变→问鼎', materials: [{ id: 'qicai_xuelian', name: '七彩雪莲', quantity: 3 }, { id: 'wannian_lingzhi', name: '万年灵芝', quantity: 3 }], cost: 100000, effect: '突破概率 +20%' },
]

export interface ForgeRecipe {
  id: string
  name: string
  slot: string
  materials: { id: string; qty: number }[]
  cost: number
}

export const forgeRecipes: ForgeRecipe[] = [
  { id: 'wooden_sword', name: '木剑', slot: 'weapon', materials: [{ id: 'youhun_cao', qty: 3 }], cost: 50 },
  { id: 'bronze_armor', name: '青铜甲', slot: 'armor', materials: [{ id: 'ningxue_hua', qty: 3 }], cost: 80 },
  { id: 'jade_pendant', name: '玉佩', slot: 'accessory', materials: [{ id: 'hansui_ye', qty: 3 }], cost: 100 },
  { id: 'spirit_circlet', name: '灵环', slot: 'artifact', materials: [{ id: 'longxian_guo', qty: 2 }, { id: 'wannian_lingzhi', qty: 1 }], cost: 500 },
]

/** Roll equipment quality. Returns index 0-4 */
export function rollQuality(): number {
  const r = Math.random()
  if (r < 0.50) return 0 // 凡器 50%
  if (r < 0.80) return 1 // 法器 30%
  if (r < 0.95) return 2 // 宝器 15%
  if (r < 0.99) return 3 // 灵器 4%
  return 4              // 仙器 1%
}

/** Calculate bonus rates based on quality */
export function calcQualityBonuses(quality: number) {
  const lingqiBonus = [0.02, 0.05, 0.10, 0.20, 0.40][quality] || 0
  const lingshiBonus = [0.02, 0.05, 0.10, 0.20, 0.40][quality] || 0
  return { bonusLingqiRate: lingqiBonus, bonusLingshiRate: lingshiBonus }
}

/** Clan level thresholds: exp needed to reach each level */
export const clanLevelExp = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5000]

/** Clan level bonus: lingqiRate bonus per level (2%) */
export function getClanLevelBonus(level: number): number {
  return (level - 1) * 0.02
}

export const dailyClanTasks = [
  { taskType: 'collect_herb', title: '采集灵草', description: '收集任意炼丹材料', targetCount: 3, rewardExp: 10, rewardContribution: 10 },
  { taskType: 'gain_lingqi', title: '勤修苦练', description: '获得灵气', targetCount: 500, rewardExp: 15, rewardContribution: 15 },
  { taskType: 'dao_with_member', title: '宗门论道', description: '与宗门成员论道', targetCount: 1, rewardExp: 20, rewardContribution: 20 },
  { taskType: 'forge_item', title: '锻造装备', description: '锻造任意装备', targetCount: 1, rewardExp: 25, rewardContribution: 25 },
]

export const materialNames: Record<string, string> = {
  youhun_cao: '幽魂草',
  ningxue_hua: '凝血花',
  hansui_ye: '寒髓叶',
  longxian_guo: '龙涎果',
  wannian_lingzhi: '万年灵芝',
  qicai_xuelian: '七彩雪莲',
}
