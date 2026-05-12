import { eq } from 'drizzle-orm'
import { characters, equipment } from '../../db/schema'
import { qualityNames, qualityColors } from '../../utils/game-engine'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const db = useDB()

  const char = await useCharacter(event)

  const items = await db.select()
    .from(equipment)
    .where(eq(equipment.characterId, char.id))
    .orderBy(equipment.createdAt)

  return {
    items: items.map(i => ({
      ...i,
      qualityName: qualityNames[i.quality] || '未知',
      qualityColor: qualityColors[i.quality] || 'text-ink-300',
    })),
  }
})
