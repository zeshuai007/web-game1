import { eq } from 'drizzle-orm'
import { users, characters } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const db = useDB()

  const [user] = await db.select().from(users).where(eq(users.id, userId))
  if (!user) {
    throw createError({ statusCode: 404, message: '用户不存在' })
  }

  const char = await useCharacter(event)

  return {
    user: { id: user.id, email: user.email },
    character: char,
  }
})
