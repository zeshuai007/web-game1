import { eq, and } from 'drizzle-orm'
import { characters, adventureEvents as adventureTable, type Realm } from '../../db/schema'
import { rollAdventureEvent } from '../../utils/game-engine'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const db = useDB()

  const [char] = await db.select().from(characters).where(eq(characters.userId, userId))
  if (!char) throw createError({ statusCode: 404, message: '角色不存在' })

  // Check for existing pending event
  const [pending] = await db.select()
    .from(adventureTable)
    .where(and(
      eq(adventureTable.characterId, char.id),
      eq(adventureTable.state, 'pending'),
    ))
    .limit(1)

  if (pending) {
    return { event: { id: pending.id, type: pending.eventType, data: JSON.parse(pending.eventData), state: pending.state } }
  }

  // Try to trigger a random event
  const triggered = rollAdventureEvent(char.realm as Realm)
  if (!triggered) {
    return { event: null }
  }

  const choices = triggered.choices.map((c, i) => ({ index: i, label: c.label, desc: c.desc }))

  const [record] = await db.insert(adventureTable).values({
    characterId: char.id,
    eventType: triggered.type,
    eventData: JSON.stringify({ title: triggered.title, description: triggered.description, choices }),
    state: 'pending',
  }).returning()

  return { event: { id: record.id, type: triggered.type, data: { title: triggered.title, description: triggered.description, choices }, state: 'pending' } }
})
