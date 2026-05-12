import { eq, and } from 'drizzle-orm'
import { characters, friendRequests } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const body = await readBody(event)
  const { toCharacterId } = body || {}
  const db = useDB()

  const [from] = await db.select().from(characters).where(eq(characters.userId, userId))
  if (!from) throw createError({ statusCode: 404, message: '角色不存在' })
  if (from.id === toCharacterId) throw createError({ statusCode: 400, message: '不能加自己为好友' })

  const [existing] = await db.select()
    .from(friendRequests)
    .where(and(eq(friendRequests.fromCharacterId, from.id), eq(friendRequests.toCharacterId, toCharacterId)))
    .limit(1)

  if (existing) throw createError({ statusCode: 409, message: '已发送过好友请求' })

  // Also check reverse direction
  const [reverse] = await db.select()
    .from(friendRequests)
    .where(and(eq(friendRequests.fromCharacterId, toCharacterId), eq(friendRequests.toCharacterId, from.id)))
    .limit(1)
  if (reverse) throw createError({ statusCode: 409, message: '对方已向你发送过好友请求' })

  const [req] = await db.insert(friendRequests).values({ fromCharacterId: from.id, toCharacterId }).returning()
  return { id: req.id, status: req.status }
})
