// Re-export all domain modules for backward compatibility
export * from './realm-config'
export * from './alchemy-data'
export * from './adventure-data'
export * from './forge-data'
export * from './clan-data'

import { characters, type Realm } from '../db/schema'
import { realmConfigs, breakthroughBaseChance, getRealmBoundaryKey } from './realm-config'

export * from './realm-config'
export * from './alchemy-data'
export * from './adventure-data'
export * from './forge-data'
export * from './clan-data'

export function calcOfflineEarnings(char: typeof characters.$inferSelect, elapsedMinutes: number) {
  const cap = 24 * 60
  const effectiveMinutes = Math.min(elapsedMinutes, cap)
  const cfg = realmConfigs[char.realm as Realm]
  const lingqiGain = cfg.lingqiRate * effectiveMinutes
  const lingshiGain = cfg.lingshiRate * effectiveMinutes
  return { lingqiGain, lingshiGain, effectiveMinutes }
}

export function breakthroughRoll(realm: Realm, hasBreakthroughPill: boolean): boolean {
  const key = getRealmBoundaryKey(realm)
  const base = breakthroughBaseChance[key] ?? 0.15
  const chance = hasBreakthroughPill ? Math.min(base + 0.2, 0.9) : base
  return Math.random() < chance
}
