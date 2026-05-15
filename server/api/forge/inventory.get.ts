import { eq } from 'drizzle-orm'
import { characters, equipment } from '../../db/schema'
import { getQualityConfigFromDB } from '../../utils/config'

export default defineEventHandler(async (event) => {
  const db = useDB()

  const char = await useCharacter(event)

  const qualityConfig = await getQualityConfigFromDB(db)

  const items = await db.select()
    .from(equipment)
    .where(eq(equipment.characterId, char.id))
    .orderBy(equipment.createdAt)

  return {
    items: items.map(i => {
      const tier = qualityConfig.find(q => q.quality === i.quality)
      return {
        ...i,
        qualityName: tier?.name || '未知',
        qualityColor: tier?.color || 'text-ink-300',
      }
    }),
  }
})