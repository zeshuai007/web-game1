import { eq, and } from 'drizzle-orm'
import { characters, equipment } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const body = await readBody(event)
  const { equipmentId, unequip } = body || {}
  const db = useDB()

  const char = await useCharacter(event)

  const [item] = await db.select().from(equipment).where(eq(equipment.id, equipmentId)).limit(1)
  if (!item || item.characterId !== char.id) throw createError({ statusCode: 404, message: '装备不存在' })

  if (unequip) {
    await db.update(equipment).set({ equipped: 0 }).where(eq(equipment.id, equipmentId))
    return { success: true, message: '已卸下装备' }
  }

  // Unequip any existing item in same slot
  await db.update(equipment)
    .set({ equipped: 0 })
    .where(and(eq(equipment.characterId, char.id), eq(equipment.slot, item.slot)))

  // Equip new item
  await db.update(equipment).set({ equipped: 1 }).where(eq(equipment.id, equipmentId))

  return { success: true, message: `已装备${item.name}` }
})
