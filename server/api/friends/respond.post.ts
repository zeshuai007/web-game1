import { eq } from 'drizzle-orm'
import { characters, friendRequests } from '../../db/schema'
import { fireAchievementCheck } from '../../utils/achievement-engine'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const body = await readBody(event)
  const { requestId, action } = body || {}
  const db = useDB()

  const [char] = await db.select().from(characters).where(eq(characters.userId, userId))
  if (!char) throw createError({ statusCode: 404, message: '角色不存在' })

  const [req] = await db.select().from(friendRequests).where(eq(friendRequests.id, requestId)).limit(1)
  if (!req) throw createError({ statusCode: 404, message: '请求不存在' })
  if (req.toCharacterId !== char.id) throw createError({ statusCode: 403, message: '无权操作' })

  if (!['accept', 'reject'].includes(action)) throw createError({ statusCode: 400, message: '无效操作' })

  const status = action === 'accept' ? 'accepted' : 'rejected'
  const [updated] = await db.update(friendRequests)
    .set({ status, updatedAt: new Date() })
    .where(eq(friendRequests.id, requestId))
    .returning()

  if (status === 'accepted') fireAchievementCheck(event, 'friend')
  return { id: updated.id, status: updated.status }
})
