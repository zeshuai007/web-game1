import { eq, and } from 'drizzle-orm'
import { characters, inventory, equipment } from '../../db/schema'
import { forgeRecipes, rollQuality, calcQualityBonuses, qualityNames } from '../../utils/game-engine'
import { fireAchievementCheck } from '../../utils/achievement-engine'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const body = await readBody(event)
  const { recipeId } = body || {}
  const db = useDB()

  const recipe = forgeRecipes.find(r => r.id === recipeId)
  if (!recipe) throw createError({ statusCode: 400, message: '未知的锻造配方' })

  const [char] = await db.select().from(characters).where(eq(characters.userId, userId))
  if (!char) throw createError({ statusCode: 404, message: '角色不存在' })

  // Check lingshi
  const lingshi = parseFloat(char.lingshi)
  if (lingshi < recipe.cost) throw createError({ statusCode: 400, message: '灵石不足' })

  // Check and deduct materials
  for (const mat of recipe.materials) {
    const [inv] = await db.select()
      .from(inventory)
      .where(and(eq(inventory.characterId, char.id), eq(inventory.itemId, mat.id)))
      .limit(1)
    if (!inv || inv.quantity < mat.qty) throw createError({ statusCode: 400, message: `材料不足：${mat.id}` })
    await db.update(inventory).set({ quantity: inv.quantity - mat.qty }).where(eq(inventory.id, inv.id))
  }

  // Deduct lingshi
  await db.update(characters).set({ lingshi: String(lingshi - recipe.cost) }).where(eq(characters.id, char.id))

  // Roll quality
  const quality = rollQuality()
  const bonuses = calcQualityBonuses(quality)
  const qualityName = qualityNames[quality]
  const itemName = `${qualityName}${recipe.name}`

  const [eqp] = await db.insert(equipment).values({
    characterId: char.id,
    slot: recipe.slot,
    name: itemName,
    quality,
    bonusLingqiRate: String(bonuses.bonusLingqiRate),
    bonusLingshiRate: String(bonuses.bonusLingshiRate),
  }).returning()

  fireAchievementCheck(event, 'forge')
  return { equipment: eqp, quality, qualityName, message: `锻造成功！获得${qualityName}${recipe.name}` }
})
