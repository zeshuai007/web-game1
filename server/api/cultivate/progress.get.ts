import { eq } from 'drizzle-orm'
import { characters } from '../../db/schema'
import { realmConfigs, calcOfflineEarnings, type Realm } from '../../utils/game-engine'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const db = useDB()

  const [char] = await db.select().from(characters).where(eq(characters.userId, userId))
  if (!char) {
    throw createError({ statusCode: 404, message: '角色不存在' })
  }

  const cfg = realmConfigs[char.realm as Realm]
  const now = new Date()

  // Calculate offline earnings
  const lastOnline = new Date(char.offlineStartedAt)
  const elapsedMs = Math.max(0, now.getTime() - lastOnline.getTime())
  const elapsedMinutes = elapsedMs / (1000 * 60)

  const { lingqiGain, lingshiGain, effectiveMinutes } = calcOfflineEarnings(char, elapsedMinutes)

  // Update character with offline earnings
  const newLingqi = Math.min(
    parseFloat(char.lingqi) + lingqiGain,
    cfg.lingqiCap
  )
  const newLingshi = parseFloat(char.lingshi) + lingshiGain

  await db.update(characters)
    .set({
      lingqi: String(newLingqi),
      lingshi: String(newLingshi),
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
