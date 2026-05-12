import { sql } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const db = useDB()
  await db.execute(sql`DELETE FROM clan_task_progress`)
  await db.execute(sql`DELETE FROM clan_tasks`)
  await db.execute(sql`DELETE FROM clan_members`)
  await db.execute(sql`DELETE FROM clans`)
  return { success: true }
})
