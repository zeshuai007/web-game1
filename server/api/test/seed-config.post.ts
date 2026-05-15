import { seedConfig } from '../../db/seed'

export default defineEventHandler(async () => {
  const db = useDB()
  await seedConfig(db)
  return { success: true }
})