import { eq, and } from 'drizzle-orm'
import { characters, adventureEvents as adventureTable } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const db = useDB()
  const [char] = await db.select().from(characters).where(eq(characters.userId, userId))
  if (!char) throw createError({ statusCode: 404, message: '角色不存在' })

  // Mark all pending events as expired
  await db.update(adventureTable)
    .set({ state: 'expired' })
    .where(and(eq(adventureTable.characterId, char.id), eq(adventureTable.state, 'pending')))

  return { success: true }
})
