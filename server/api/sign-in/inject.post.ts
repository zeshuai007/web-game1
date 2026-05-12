import { eq } from 'drizzle-orm'
import { characters, signInRecords } from '../../db/schema'

// Test-only endpoint to inject a sign-in record for a past date
export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const body = await readBody(event)
  const { characterId, signDate, consecutiveDays, reward } = body || {}

  const db = useDB()

  const [char] = await db.select().from(characters).where(eq(characters.userId, userId))
  if (!char) throw createError({ statusCode: 404, message: '角色不存在' })
  if (char.id !== characterId) throw createError({ statusCode: 403, message: '角色不匹配' })

  await db.insert(signInRecords).values({ characterId, signDate, consecutiveDays, reward: String(reward) })
  return { success: true }
})
