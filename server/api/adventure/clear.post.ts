import { eq, and } from 'drizzle-orm'
import { characters, adventureEvents as adventureTable } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const db = useDB()
  const char = await useCharacter(event)

  // Mark all pending events as expired
  await db.update(adventureTable)
    .set({ state: 'expired' })
    .where(and(eq(adventureTable.characterId, char.id), eq(adventureTable.state, 'pending')))

  return { success: true }
})
