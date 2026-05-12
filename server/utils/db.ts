import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'

const { Pool } = pg

let db: ReturnType<typeof drizzle> | null = null

export function useDB() {
  if (!db) {
    const config = useRuntimeConfig()
    const pool = new Pool({
      connectionString: config.dbConnectionString,
    })
    db = drizzle(pool)
  }
  return db
}
