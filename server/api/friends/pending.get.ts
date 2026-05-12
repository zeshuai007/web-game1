import { eq, and } from 'drizzle-orm'
import { characters, friendRequests } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const db = useDB()

  const [char] = await db.select().from(characters).where(eq(characters.userId, userId))
  if (!char) throw createError({ statusCode: 404, message: '角色不存在' })

  const requests = await db.select()
    .from(friendRequests)
    .where(and(eq(friendRequests.toCharacterId, char.id), eq(friendRequests.status, 'pending')))

  return { requests }
})
