import { realmEnum, type Realm } from '../db/schema'

export { realmEnum }
export type { Realm }

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

export { getRealmBoundaryKey }
