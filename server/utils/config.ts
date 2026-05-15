import { eq, sql } from 'drizzle-orm'
import { configRealms, configQuality, configClanDailyTasks, configClanLevels, configAdventureEvents, realmEnum, type Realm } from '../db/schema'

/** Fetch realm config from DB, with fallback to provided default */
export async function getRealmFromDB(db: ReturnType<typeof useDB>, realm: Realm) {
  const [row] = await db.select().from(configRealms).where(eq(configRealms.key, realm)).limit(1)
  if (!row) return null
  return {
    key: row.key,
    label: row.label,
    lingqiCap: parseFloat(row.lingqiCap),
    lingshiRate: parseFloat(row.lingshiRate),
    lingqiRate: parseFloat(row.lingqiRate),
    breakthroughChance: parseFloat(row.breakthroughChance),
    maxLayer: row.maxLayer,
    progressRetainRate: row.progressRetainRate == null ? undefined : parseFloat(row.progressRetainRate),
    pityChanceStep: row.pityChanceStep == null ? undefined : parseFloat(row.pityChanceStep),
    pityChanceMax: row.pityChanceMax == null ? undefined : parseFloat(row.pityChanceMax),
    sortOrder: row.sortOrder,
  }
}

/** Get breakthrough base chance for a realm boundary from DB */
export async function getBreakthroughChanceFromDB(db: ReturnType<typeof useDB>, currentRealm: Realm): Promise<number> {
  const cfg = await getRealmFromDB(db, currentRealm)
  return cfg?.breakthroughChance ?? 0.15
}

/** Fetch all quality tiers from DB */
export async function getQualityConfigFromDB(db: ReturnType<typeof useDB>) {
  const rows = await db.select().from(configQuality).orderBy(configQuality.quality)
  return rows.map(r => ({
    quality: r.quality,
    name: r.name,
    color: r.color,
    rollThreshold: parseFloat(r.rollThreshold),
    bonusRate: parseFloat(r.bonusRate),
  }))
}

/** Roll equipment quality using DB config */
export function rollQualityWithConfig(qualityConfig: { quality: number; rollThreshold: number }[]): number {
  const r = Math.random()
  for (const tier of qualityConfig) {
    if (r < tier.rollThreshold) return tier.quality
  }
  return qualityConfig[qualityConfig.length - 1]?.quality ?? 0
}

/** Calculate quality bonuses using DB config */
export function calcQualityBonusesWithConfig(quality: number, qualityConfig: { quality: number; bonusRate: number }[]) {
  const tier = qualityConfig.find(t => t.quality === quality)
  const rate = tier?.bonusRate ?? 0
  return { bonusLingqiRate: rate, bonusLingshiRate: rate }
}

/** Fetch all clan daily task templates from DB */
export async function getClanDailyTasksFromDB(db: ReturnType<typeof useDB>) {
  return await db.select().from(configClanDailyTasks).orderBy(configClanDailyTasks.sortOrder)
}

/** Fetch clan level config from DB */
export async function getClanLevelsFromDB(db: ReturnType<typeof useDB>) {
  return await db.select().from(configClanLevels).orderBy(configClanLevels.level)
}

/** Calculate clan level bonus from DB config */
export async function getClanLevelBonusFromDB(db: ReturnType<typeof useDB>, level: number): Promise<number> {
  const levels = await getClanLevelsFromDB(db)
  const cfg = levels.find(l => l.level === level)
  if (cfg) return parseFloat(cfg.bonusRate)
  return (level - 1) * 0.02
}

/** Fetch all adventure events from DB */
export async function getAdventureEventsFromDB(db: ReturnType<typeof useDB>) {
  const rows = await db.select().from(configAdventureEvents).orderBy(configAdventureEvents.sortOrder)
  return rows.map(r => ({
    type: r.eventType,
    title: r.title,
    description: r.description,
    choices: JSON.parse(r.choicesJson) as { label: string; desc: string }[],
    rewards: JSON.parse(r.rewardsJson) as { type: string; value: number }[],
    baseChance: parseFloat(r.baseChance),
  }))
}

/** Roll an adventure event using DB config */
export function rollAdventureEventWithConfig(
  events: { type: string; baseChance: number }[],
  realm: Realm,
): { type: string } | null {
  const realmIdx = realmEnum.indexOf(realm)
  const multiplier = 1 + realmIdx * 0.2
  for (const event of events) {
    if (Math.random() < event.baseChance * multiplier) return event
  }
  return null
}

/** Check whether DB config tables are empty (for auto-seed) */
export async function isConfigEmpty(db: ReturnType<typeof useDB>): Promise<boolean> {
  const [result] = await db.select({ count: sql`count(*)` }).from(configRealms)
  return parseInt(String(result?.count || '0')) === 0
}
