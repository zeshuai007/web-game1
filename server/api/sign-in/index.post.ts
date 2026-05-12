import { eq, and, sql } from 'drizzle-orm'
import { characters, signInRecords } from '../../db/schema'

function calcReward(consecutiveDays: number): number {
  // Day 1-7: 10, 15, 25, 40, 55, 75, 100
  // Day 8-28: +5 each day, day 28 = 205
  // Day 28+ resets to 28 (stays at max)
  const day = Math.min(consecutiveDays, 28)
  if (day <= 7) {
    const rewards = [10, 15, 25, 40, 55, 75, 100]
    return rewards[day - 1]
  }
  return 100 + (day - 7) * 5
}

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const db = useDB()

  const [char] = await db.select().from(characters).where(eq(characters.userId, userId))
  if (!char) {
    throw createError({ statusCode: 404, message: '角色不存在' })
  }

  const today = new Date().toISOString().slice(0, 10) // '2026-05-12'

  // Check existing sign-in for today
  const [existing] = await db.select()
    .from(signInRecords)
    .where(and(
      eq(signInRecords.characterId, char.id),
      eq(signInRecords.signDate, today),
    ))
    .limit(1)

  if (existing) {
    throw createError({ statusCode: 409, message: '今日已签到' })
  }

  // Calculate consecutive days from yesterday's record
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const [yesterdayRecord] = await db.select()
    .from(signInRecords)
    .where(and(
      eq(signInRecords.characterId, char.id),
      eq(signInRecords.signDate, yesterday),
    ))
    .limit(1)

  const consecutiveDays = yesterdayRecord ? yesterdayRecord.consecutiveDays + 1 : 1
  const reward = calcReward(consecutiveDays)

  // Create sign-in record
  await db.insert(signInRecords).values({
    characterId: char.id,
    signDate: today,
    consecutiveDays,
    reward: String(reward),
  })

  // Add reward lingshi
  const newLingshi = parseFloat(char.lingshi) + reward
  await db.update(characters)
    .set({ lingshi: String(newLingshi), updatedAt: new Date() })
    .where(eq(characters.id, char.id))

  return { success: true, reward, consecutiveDays }
})
