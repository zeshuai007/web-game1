import { eq } from 'drizzle-orm'
import { characters, configRealms } from '../../db/schema'
import { realmConfigs, type Realm } from '../../utils/game-engine'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const db = useDB()

  const char = await useCharacter(event)

  const [configuredRealm] = await db.select().from(configRealms).where(eq(configRealms.key, char.realm)).limit(1)
  const cfg = configuredRealm
    ? {
        ...realmConfigs[char.realm as Realm],
        lingqiCap: parseFloat(configuredRealm.lingqiCap),
        lingshiRate: parseFloat(configuredRealm.lingshiRate),
        lingqiRate: parseFloat(configuredRealm.lingqiRate),
      }
    : realmConfigs[char.realm as Realm]
  const now = new Date()

  // Calculate offline earnings
  const lastOnline = new Date(char.offlineStartedAt)
  const elapsedMs = Math.max(0, now.getTime() - lastOnline.getTime())
  const elapsedMinutes = elapsedMs / (1000 * 60)
  const cap = 24 * 60
  const effectiveMinutes = Math.min(elapsedMinutes, cap)

  const lingqiGain = cfg.lingqiRate * effectiveMinutes
  const lingshiGain = cfg.lingshiRate * effectiveMinutes

  // Update character with offline earnings
  const currentLingqi = parseFloat(char.lingqi)
  const newLingqi = currentLingqi >= cfg.lingqiCap
    ? currentLingqi
    : Math.min(currentLingqi + lingqiGain, cfg.lingqiCap)
  const newLingshi = parseFloat(char.lingshi) + lingshiGain

  await db.update(characters)
    .set({
      lingqi: String(newLingqi),
      lingshi: String(newLingshi),
      lingqiCap: String(cfg.lingqiCap),
      lingqiRate: String(cfg.lingqiRate),
      lingshiRate: String(cfg.lingshiRate),
      offlineStartedAt: now,
      updatedAt: now,
    })
    .where(eq(characters.id, char.id))

  const [updated] = await db.select().from(characters).where(eq(characters.id, char.id))

  return {
    character: updated,
    offlineEarnings: {
      lingqi: lingqiGain,
      lingshi: lingshiGain,
      minutes: effectiveMinutes,
    },
    realmConfig: cfg,
    nextRealmCap: cfg.lingqiCap,
  }
})
