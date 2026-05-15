import { eq, and } from 'drizzle-orm'
import { characters, inventory, adventureEvents as adventureTable, configMaterialNames } from '../../db/schema'
import { getAdventureEventsFromDB } from '../../utils/config'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { choice } = body || {}
  const db = useDB()

  const char = await useCharacter(event)

  const [pending] = await db.select()
    .from(adventureTable)
    .where(and(
      eq(adventureTable.characterId, char.id),
      eq(adventureTable.state, 'pending'),
    ))
    .limit(1)

  if (!pending) {
    throw createError({ statusCode: 400, message: '没有待处理的奇遇事件' })
  }

  const events = await getAdventureEventsFromDB(db)
  const eventDef = events.find(e => e.type === pending.eventType)
  if (!eventDef) {
    throw createError({ statusCode: 400, message: '未知的事件类型' })
  }

  const chosenIndex = choice ?? 0
  const chosenReward = eventDef.rewards[Math.min(chosenIndex, eventDef.rewards.length - 1)]

  // Fetch material name map from DB
  const matRows = await db.select().from(configMaterialNames)
  const nameMap: Record<string, string> = {}
  for (const row of matRows) nameMap[row.itemId] = row.name

  // Apply reward
  let rewardMsg = ''
  if (chosenReward.type === 'lingshi') {
    const newLingshi = parseFloat(char.lingshi) + chosenReward.value
    await db.update(characters)
      .set({ lingshi: String(newLingshi), updatedAt: new Date() })
      .where(eq(characters.id, char.id))
    rewardMsg = `获得 ${chosenReward.value} 灵石`
  } else if (chosenReward.type === 'lingqi') {
    const newLingqi = Math.min(parseFloat(char.lingqi) + chosenReward.value, parseFloat(char.lingqiCap))
    await db.update(characters)
      .set({ lingqi: String(newLingqi), updatedAt: new Date() })
      .where(eq(characters.id, char.id))
    rewardMsg = `获得 ${chosenReward.value} 灵气`
  } else if (chosenReward.type === 'breakthrough_bonus') {
    rewardMsg = '下次突破概率略微提升（心魔试炼的感悟）'
  } else if (chosenReward.type.startsWith('material_')) {
    const materialId = chosenReward.type.replace('material_', '')
    const matName = nameMap[materialId] || materialId
    const [existing] = await db.select()
      .from(inventory)
      .where(and(eq(inventory.characterId, char.id), eq(inventory.itemId, materialId)))
      .limit(1)
    if (existing) {
      await db.update(inventory).set({ quantity: existing.quantity + chosenReward.value }).where(eq(inventory.id, existing.id))
    } else {
      await db.insert(inventory).values({ characterId: char.id, itemType: 'material', itemId: materialId, quantity: chosenReward.value })
    }
    rewardMsg = `获得 ${matName} ×${chosenReward.value}`
  }

  // Mark resolved
  await db.update(adventureTable)
    .set({ state: 'resolved', resolvedAt: new Date() })
    .where(eq(adventureTable.id, pending.id))

  return { success: true, message: rewardMsg, choice: chosenIndex }
})