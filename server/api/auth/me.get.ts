import { eq } from 'drizzle-orm'
import { users, characters } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const db = useDB()

  const [user] = await db.select().from(users).where(eq(users.id, userId))
  if (!user) {
    throw createError({ statusCode: 404, message: '用户不存在' })
  }

  const [char] = await db.select().from(characters).where(eq(characters.userId, userId))
  if (!char) {
    throw createError({ statusCode: 404, message: '角色不存在' })
  }

  return {
    user: { id: user.id, email: user.email },
    character: char,
  }
})
