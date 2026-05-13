import { eq } from 'drizzle-orm'
import { configRealms } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const realms = Array.isArray(body?.realms) ? body.realms : []
  const db = useDB()

  for (const realm of realms) {
    if (!realm?.key) continue
    await db.update(configRealms)
      .set({
        lingqiCap: String(realm.lingqiCap),
        lingshiRate: String(realm.lingshiRate),
        lingqiRate: String(realm.lingqiRate),
        breakthroughChance: String(realm.breakthroughChance),
        progressRetainRate: realm.progressRetainRate == null ? null : String(realm.progressRetainRate),
        pityChanceStep: realm.pityChanceStep == null ? null : String(realm.pityChanceStep),
        pityChanceMax: realm.pityChanceMax == null ? null : String(realm.pityChanceMax),
      })
      .where(eq(configRealms.key, realm.key))
  }

  return { success: true }
})
