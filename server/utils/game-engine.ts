import { characters, realmEnum, type Realm, realmLabels } from '../db/schema'

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

export const materialNames: Record<string, string> = {
  youhun_cao: '幽魂草',
  ningxue_hua: '凝血花',
  hansui_ye: '寒髓叶',
  longxian_guo: '龙涎果',
  wannian_lingzhi: '万年灵芝',
  qicai_xuelian: '七彩雪莲',
}
