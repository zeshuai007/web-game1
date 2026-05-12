import { eq, or } from 'drizzle-orm'
import { characters, friendRequests } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const id = getRouterParam(event, 'id')
  const db = useDB()

  const [char] = await db.select().from(characters).where(eq(characters.userId, userId))
  if (!char) throw createError({ statusCode: 404, message: '角色不存在' })

  const [req] = await db.select().from(friendRequests).where(eq(friendRequests.id, id)).limit(1)
  if (!req) throw createError({ statusCode: 404, message: '请求不存在' })
  if (req.fromCharacterId !== char.id && req.toCharacterId !== char.id) {
    throw createError({ statusCode: 403, message: '无权操作' })
  }

  await db.delete(friendRequests).where(eq(friendRequests.id, id))
  return { success: true }
})
