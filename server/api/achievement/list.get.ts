import { eq, and } from 'drizzle-orm'
import { characters, achievements, characterAchievements, configAchievementDefs } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const db = useDB()

  const char = await useCharacter(event)

  const existing = await db.select().from(characterAchievements)
    .where(eq(characterAchievements.characterId, char.id)).limit(1)

  if (existing.length === 0) {
    const defs = await db.select().from(configAchievementDefs).orderBy(configAchievementDefs.sortOrder)
    for (const def of defs) {
      let achId = ''
      const [existingAch] = await db.select().from(achievements).where(eq(achievements.key, def.key)).limit(1)
      if (existingAch) {
        achId = existingAch.id
      } else {
        const [newAch] = await db.insert(achievements).values(def as any).returning()
        achId = newAch.id
      }
      try { await db.insert(characterAchievements).values({ characterId: char.id, achievementId: achId }) } catch { /* already exists */ }
    }
  }

  const allAch = await db.select({
    a: achievements,
    ca: characterAchievements,
  }).from(achievements)
    .innerJoin(characterAchievements, and(
      eq(achievements.id, characterAchievements.achievementId),
      eq(characterAchievements.characterId, char.id),
    ))
    .orderBy(achievements.sortOrder)

  return {
    achievements: allAch.map(({ a, ca }) => ({
      key: a.key, category: a.category, name: a.name, description: a.description,
      conditionType: a.conditionType, conditionValue: a.conditionValue,
      rewardType: a.rewardType, rewardValue: a.rewardValue,
      progress: ca.progress, completed: ca.completed, claimed: ca.claimed,
    })),
  }
})
