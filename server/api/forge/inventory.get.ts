import { eq } from 'drizzle-orm'
import { characters, equipment } from '../../db/schema'
import { qualityNames, qualityColors } from '../../utils/game-engine'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const db = useDB()

  const [char] = await db.select().from(characters).where(eq(characters.userId, userId))
  if (!char) throw createError({ statusCode: 404, message: '角色不存在' })

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
