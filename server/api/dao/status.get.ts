import { eq, and } from 'drizzle-orm'
import { characters, daoRecords } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const query = getQuery(event)
  const targetId = query.targetId as string
  const db = useDB()

  const [from] = await db.select().from(characters).where(eq(characters.userId, userId))
  if (!from) throw createError({ statusCode: 404, message: '角色不存在' })

  const today = new Date().toISOString().slice(0, 10)

  const [record] = await db.select()
    .from(daoRecords)
    .where(and(
      eq(daoRecords.fromCharacterId, from.id),
      eq(daoRecords.toCharacterId, targetId),
      eq(daoRecords.daoDate, today),
    ))
    .limit(1)

  return { doneToday: !!record }
})
