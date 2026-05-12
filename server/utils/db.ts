import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { eq } from 'drizzle-orm'
import { characters } from '../db/schema'

const { Pool } = pg

let db: ReturnType<typeof drizzle> | null = null

export function useDB() {
  if (!db) {
    const config = useRuntimeConfig()
    const pool = new Pool({
      connectionString: config.dbConnectionString,
    })
    pool.on('error', () => { db = null })
    db = drizzle(pool)
  }
  return db
}

/** Get current character from DB, cached per request via event.context */
export async function useCharacter(event: any) {
  if (event.context.character) return event.context.character
  const userId = event.context.userId
  if (!userId) throw createError({ statusCode: 401, message: '未登录' })
  const db = useDB()
  const [char] = await db.select().from(characters).where(eq(characters.userId, userId))
  if (!char) throw createError({ statusCode: 404, message: '角色不存在' })
  event.context.character = char
  return char
}
