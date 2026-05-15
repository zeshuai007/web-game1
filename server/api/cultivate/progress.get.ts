import { eq } from 'drizzle-orm'
import { characters } from '../../db/schema'
import { type Realm } from '../../utils/realm-config'
import { getRealmFromDB } from '../../utils/config'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const db = useDB()

  const char = await useCharacter(event)

  const cfg = await getRealmFromDB(db, char.realm as Realm)
  if (!cfg) {
    throw createError({ statusCode: 500, message: '境界配置不存在' })
  }

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