import { eq, and } from 'drizzle-orm'
import { characters, daoRecords, friendRequests, type Realm } from '../../db/schema'
import { realmConfigs, realmEnum } from '../../utils/game-engine'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const body = await readBody(event)
  const { targetCharacterId } = body || {}
  const db = useDB()

  const [from] = await db.select().from(characters).where(eq(characters.userId, userId))
  if (!from) throw createError({ statusCode: 404, message: '角色不存在' })

  // Verify friendship
  const [friendship] = await db.select()
    .from(friendRequests)
    .where(and(
      eq(friendRequests.status, 'accepted'),
      and(
        eq(friendRequests.fromCharacterId, from.id),
        eq(friendRequests.toCharacterId, targetCharacterId),
      ),
    ))
    .limit(1)

  if (!friendship) {
    // Check reverse direction
    const [rev] = await db.select()
      .from(friendRequests)
      .where(and(
        eq(friendRequests.status, 'accepted'),
        eq(friendRequests.fromCharacterId, targetCharacterId),
        eq(friendRequests.toCharacterId, from.id),
      ))
      .limit(1)
    if (!rev) throw createError({ statusCode: 400, message: '不是好友关系' })
  }

  const today = new Date().toISOString().slice(0, 10)

  // Check duplicate
  const [existing] = await db.select()
    .from(daoRecords)
    .where(and(
      eq(daoRecords.fromCharacterId, from.id),
      eq(daoRecords.toCharacterId, targetCharacterId),
      eq(daoRecords.daoDate, today),
    ))
    .limit(1)
  if (existing) throw createError({ statusCode: 409, message: '今日已论道' })

  // Calculate gains - use lower realm for calculation
  const [target] = await db.select().from(characters).where(eq(characters.id, targetCharacterId)).limit(1)
  if (!target) throw createError({ statusCode: 404, message: '目标角色不存在' })

  const fromIdx = realmEnum.indexOf(from.realm as Realm)
  const targetIdx = realmEnum.indexOf(target.realm as Realm)
  const lowerRealm = Math.min(fromIdx, targetIdx)
  const baseGain = 50 + lowerRealm * 20 // 50, 70, 90, 110...

  const fromGain = baseGain
  const targetGain = baseGain

  // Both gain lingqi
  await db.update(characters)
    .set({ lingqi: String(Math.min(parseFloat(from.lingqi) + fromGain, parseFloat(from.lingqiCap))), updatedAt: new Date() })
    .where(eq(characters.id, from.id))

  await db.update(characters)
    .set({ lingqi: String(Math.min(parseFloat(target.lingqi) + targetGain, parseFloat(target.lingqiCap))), updatedAt: new Date() })
    .where(eq(characters.id, targetCharacterId))

  // Record
  await db.insert(daoRecords).values({ fromCharacterId: from.id, toCharacterId: targetCharacterId, daoDate: today })

  return { success: true, lingqiGain: fromGain, message: `论道获益，获得 ${fromGain} 灵气` }
})
