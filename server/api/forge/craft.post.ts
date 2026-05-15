import { eq, and } from 'drizzle-orm'
import { characters, inventory, equipment, configForgeRecipes } from '../../db/schema'
import { getQualityConfigFromDB, rollQualityWithConfig, calcQualityBonusesWithConfig } from '../../utils/config'
import { fireAchievementCheck } from '../../utils/achievement-engine'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { recipeId } = body || {}
  const db = useDB()

  const [recipeRow] = await db.select().from(configForgeRecipes).where(eq(configForgeRecipes.recipeId, recipeId)).limit(1)
  if (!recipeRow) throw createError({ statusCode: 400, message: '未知的锻造配方' })
  const recipe = { id: recipeRow.recipeId, name: recipeRow.name, slot: recipeRow.slot, materials: JSON.parse(recipeRow.materialsJson) as { id: string; qty: number }[], cost: recipeRow.cost }

  const char = await useCharacter(event)

  const lingshi = parseFloat(char.lingshi)
  if (lingshi < recipe.cost) throw createError({ statusCode: 400, message: '灵石不足' })

  for (const mat of recipe.materials) {
    const [inv] = await db.select().from(inventory)
      .where(and(eq(inventory.characterId, char.id), eq(inventory.itemId, mat.id))).limit(1)
    if (!inv || inv.quantity < mat.qty) throw createError({ statusCode: 400, message: `材料不足：${mat.id}` })
    await db.update(inventory).set({ quantity: inv.quantity - mat.qty }).where(eq(inventory.id, inv.id))
  }

  await db.update(characters).set({ lingshi: String(lingshi - recipe.cost) }).where(eq(characters.id, char.id))

  const qualityConfig = await getQualityConfigFromDB(db)
  const quality = rollQualityWithConfig(qualityConfig)
  const bonuses = calcQualityBonusesWithConfig(quality, qualityConfig)
  const qualityName = qualityConfig.find(q => q.quality === quality)?.name || '凡器'

  const [eqp] = await db.insert(equipment).values({
    characterId: char.id, slot: recipe.slot, name: `${qualityName}${recipe.name}`,
    quality, bonusLingqiRate: String(bonuses.bonusLingqiRate), bonusLingshiRate: String(bonuses.bonusLingshiRate),
  }).returning()

  fireAchievementCheck(event, 'forge')
  return { equipment: eqp, quality, qualityName, message: `锻造成功！获得${qualityName}${recipe.name}` }
})