import { eq, and } from 'drizzle-orm'
import { characters, signInRecords } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const db = useDB()

  const [char] = await db.select().from(characters).where(eq(characters.userId, userId))
  if (!char) {
    throw createError({ statusCode: 404, message: '角色不存在' })
  }

  const today = new Date().toISOString().slice(0, 10)

  const [record] = await db.select()
    .from(signInRecords)
    .where(and(
      eq(signInRecords.characterId, char.id),
      eq(signInRecords.signDate, today),
    ))
    .limit(1)

  return {
    signedIn: !!record,
    consecutiveDays: record?.consecutiveDays || 0,
    todaySignDate: today,
  }
})
