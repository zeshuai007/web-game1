import { sql, eq } from 'drizzle-orm'
import { clans } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const { query } = await readBody(event) || {}
  const db = useDB()
  if (!query || query.trim().length < 1) return { clans: [] }

  const results = await db.select().from(clans)
    .where(sql`${clans.name} ILIKE ${'%' + query.trim() + '%'}`)
    .limit(20)

  return { clans: results.map(({ id, name, description, level, memberCount }) => ({ id, name, description, level, memberCount })) }
})
