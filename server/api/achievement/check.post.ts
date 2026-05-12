import { eq, and, sql } from 'drizzle-orm'
import { characters, achievements, characterAchievements, friendRequests, daoRecords, alchemyRecords, equipment } from '../../db/schema'
import { achievementDefs, type AchievementDef } from '../../utils/achievement-engine'
import { realmEnum } from '../../utils/game-engine'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const { eventType, realm } = await readBody(event) || {}
  const db = useDB()

  const char = await useCharacter(event)

  // Get current progress values — use event realm for breakthroughs
  const currentRealm = eventType === 'breakthrough' && realm ? realm : char.realm
  const realmIdx = realmEnum.indexOf(currentRealm as any)

  const friendResult = await db.select({ count: sql`count(*)` }).from(friendRequests)
    .where(and(
      sql`(${friendRequests.fromCharacterId} = ${char.id} OR ${friendRequests.toCharacterId} = ${char.id})`,
      eq(friendRequests.status, 'accepted'),
    ))
  const friendCount = friendResult[0]?.count || '0'

  const daoResult = await db.select({ count: sql`count(*)` }).from(daoRecords)
    .where(sql`${daoRecords.fromCharacterId} = ${char.id}`)
  const daoCount = daoResult[0]?.count || '0'

  const alchemyResult = await db.select({ count: sql`count(*)` }).from(alchemyRecords)
    .where(eq(alchemyRecords.characterId, char.id))
  const alchemyCount = alchemyResult[0]?.count || '0'

  const forgeResult = await db.select({ count: sql`count(*)` }).from(equipment)
    .where(eq(equipment.characterId, char.id))
  const forgeCount = forgeResult[0]?.count || '0'

  const qualityResult = await db.select({ max: sql`max(${equipment.quality})` }).from(equipment)
    .where(eq(equipment.characterId, char.id))
  const maxQuality = qualityResult[0]?.max || '0'

  const progressMap: Record<string, number> = {
    realm: realmIdx,
    friend_count: parseInt(String(friendCount)) || 0,
    dao_count: parseInt(String(daoCount)) || 0,
    alchemy_count: parseInt(String(alchemyCount)) || 0,
    forge_count: parseInt(String(forgeCount)) || 0,
    equip_quality: parseInt(String(maxQuality)) || 0,
  }

  const completed: any[] = []
  const allAchievements = await db.select().from(achievements)
  const charAchList = await db.select().from(characterAchievements)
    .where(eq(characterAchievements.characterId, char.id))

  for (const ach of allAchievements) {
    const ca = charAchList.find(c => c.achievementId === ach.id)
    if (!ca || ca.completed) continue

    const progress = progressMap[ach.conditionType] || 0
    const isCompleted = progress >= ach.conditionValue

    await db.update(characterAchievements)
      .set({ progress, completed: isCompleted ? 1 : 0, completedAt: isCompleted ? new Date() : null })
      .where(eq(characterAchievements.id, ca.id))

    if (isCompleted) {
      completed.push({ key: ach.key, name: ach.name, completed: 1 })
    }
  }

  return { completed }
})
