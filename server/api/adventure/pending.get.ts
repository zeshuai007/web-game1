import { eq, and, desc } from 'drizzle-orm'
import { characters, adventureEvents as adventureTable, type Realm } from '../../db/schema'
import { getAdventureEventsFromDB, rollAdventureEventWithConfig } from '../../utils/config'

/** 奇遇触发冷却：上次事件创建后 N 分钟内不再 roll，与轮询行为解耦（#70） */
export const ADVENTURE_COOLDOWN_MS = 10 * 60 * 1000

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const db = useDB()

  const char = await useCharacter(event)

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

  // ── 触发冷却：上一条奇遇（含已解决）距今不足冷却期则不 roll ──
  const [latest] = await db.select({ createdAt: adventureTable.createdAt })
    .from(adventureTable)
    .where(eq(adventureTable.characterId, char.id))
    .orderBy(desc(adventureTable.createdAt))
    .limit(1)
  if (latest && Date.now() - new Date(latest.createdAt).getTime() < ADVENTURE_COOLDOWN_MS) {
    return { event: null }
  }

  // Try to trigger a random event
  const events = await getAdventureEventsFromDB(db)
  const triggered = rollAdventureEventWithConfig(events, char.realm as Realm)
  if (!triggered) {
    return { event: null }
  }

  const eventDef = events.find(e => e.type === triggered.type)
  if (!eventDef) {
    return { event: null }
  }

  const choices = eventDef.choices.map((c, i) => ({ index: i, label: c.label, desc: c.desc }))

  const [record] = await db.insert(adventureTable).values({
    characterId: char.id,
    eventType: triggered.type,
    eventData: JSON.stringify({ title: eventDef.title, description: eventDef.description, choices }),
    state: 'pending',
  }).returning()

  return { event: { id: record.id, type: triggered.type, data: { title: eventDef.title, description: eventDef.description, choices }, state: 'pending' } }
})