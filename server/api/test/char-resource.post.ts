import { eq, and } from 'drizzle-orm'
import { characters, inventory } from '../../db/schema'

// Test-only endpoint to set character resources
export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const body = await readBody(event)
  const { characterId, lingshi, materials, realm, realmLayer, lingqi, lingqiCap, lingqiRate, lingshiRate, breakthroughFailureCount } = body || {}
  const db = useDB()

  const [char] = await db.select().from(characters).where(eq(characters.userId, userId))
  if (!char || char.id !== characterId) throw createError({ statusCode: 403, message: 'not allowed' })

  if (lingshi !== undefined) {
    await db.update(characters).set({ lingshi: String(lingshi) }).where(eq(characters.id, characterId))
  }

  const characterPatch: Record<string, any> = {}
  if (realm !== undefined) characterPatch.realm = realm
  if (realmLayer !== undefined) characterPatch.realmLayer = realmLayer
  if (lingqi !== undefined) characterPatch.lingqi = String(lingqi)
  if (lingqiCap !== undefined) characterPatch.lingqiCap = String(lingqiCap)
  if (lingqiRate !== undefined) characterPatch.lingqiRate = String(lingqiRate)
  if (lingshiRate !== undefined) characterPatch.lingshiRate = String(lingshiRate)
  if (breakthroughFailureCount !== undefined) characterPatch.breakthroughFailureCount = breakthroughFailureCount
  if (Object.keys(characterPatch).length > 0) {
    characterPatch.updatedAt = new Date()
    await db.update(characters).set(characterPatch).where(eq(characters.id, characterId))
  }

  if (materials) {
    for (const [matId, qty] of Object.entries(materials)) {
      const [inv] = await db.select().from(inventory)
        .where(and(eq(inventory.characterId, characterId), eq(inventory.itemId, matId as string)))
        .limit(1)
      if (inv) {
        await db.update(inventory).set({ quantity: inv.quantity + (qty as number) }).where(eq(inventory.id, inv.id))
      } else {
        await db.insert(inventory).values({ characterId, itemType: 'material', itemId: matId as string, quantity: qty as number })
      }
    }
  }

  return { success: true }
})
