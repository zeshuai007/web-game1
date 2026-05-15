import { eq, and, sql } from 'drizzle-orm'
import { achievements, characterAchievements, friendRequests, daoRecords, alchemyRecords, equipment } from '../db/schema'
import { realmEnum } from './realm-config'

/** Direct achievement check (no HTTP call) */
export async function checkAchievements(event: any, eventType: string, realm?: string) {
  const db = useDB()
  const char = await useCharacter(event)

  const currentRealm = eventType === 'breakthrough' && realm ? realm : char.realm
  const realmIdx = realmEnum.indexOf(currentRealm as any)

  const friendResult = await db.select({ count: sql`count(*)` }).from(friendRequests)
    .where(and(sql`(${friendRequests.fromCharacterId} = ${char.id} OR ${friendRequests.toCharacterId} = ${char.id})`, eq(friendRequests.status, 'accepted')))
  const daoResult = await db.select({ count: sql`count(*)` }).from(daoRecords).where(sql`${daoRecords.fromCharacterId} = ${char.id}`)
  const alchemyResult = await db.select({ count: sql`count(*)` }).from(alchemyRecords).where(eq(alchemyRecords.characterId, char.id))
  const forgeResult = await db.select({ count: sql`count(*)` }).from(equipment).where(eq(equipment.characterId, char.id))
  const qualityResult = await db.select({ max: sql`max(${equipment.quality})` }).from(equipment).where(eq(equipment.characterId, char.id))

  const progressMap: Record<string, number> = {
    realm: realmIdx,
    friend_count: parseInt(String(friendResult[0]?.count || '0')),
    dao_count: parseInt(String(daoResult[0]?.count || '0')),
    alchemy_count: parseInt(String(alchemyResult[0]?.count || '0')),
    forge_count: parseInt(String(forgeResult[0]?.count || '0')),
    equip_quality: parseInt(String(qualityResult[0]?.max || '0')),
  }

  const completed: any[] = []
  const allAch = await db.select().from(achievements)
  const charAchList = await db.select().from(characterAchievements).where(eq(characterAchievements.characterId, char.id))

  for (const ach of allAch) {
    const ca = charAchList.find(c => c.achievementId === ach.id)
    if (!ca || ca.completed) continue
    const progress = progressMap[ach.conditionType] || 0
    const isCompleted = progress >= ach.conditionValue
    await db.update(characterAchievements).set({ progress, completed: isCompleted ? 1 : 0, completedAt: isCompleted ? new Date() : null }).where(eq(characterAchievements.id, ca.id))
    if (isCompleted) completed.push({ key: ach.key, name: ach.name, completed: 1 })
  }
  return completed
}

/** Fire-and-forget achievement check */
export async function fireAchievementCheck(event: any, eventType: string, realm?: string) {
  try { await checkAchievements(event, eventType, realm) } catch { /* silent */ }
}