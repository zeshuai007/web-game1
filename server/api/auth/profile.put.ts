import { eq } from 'drizzle-orm'
import { characters } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const body = await readBody(event)
  const { nickname } = body || {}

  if (!nickname || !nickname.trim()) {
    throw createError({ statusCode: 400, message: '道号不能为空' })
  }
  if (nickname.length > 20) {
    throw createError({ statusCode: 400, message: '道号不能超过20个字符' })
  }

  const db = useDB()

  const [updated] = await db.update(characters)
    .set({ nickname: nickname.trim(), updatedAt: new Date() })
    .where(eq(characters.userId, userId))
    .returning()

  return { character: updated }
})
