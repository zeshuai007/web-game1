import { eq, and } from 'drizzle-orm'
import { characters, achievements, characterAchievements, inventory, configAchievementDefs } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const { achievementKey } = await readBody(event) || {}
  const db = useDB()

  const char = await useCharacter(event)

  const [ach] = await db.select().from(achievements).where(eq(achievements.key, achievementKey)).limit(1)
  if (!ach) throw createError({ statusCode: 404, message: '成就不存在' })

  const [ca] = await db.select().from(characterAchievements)
    .where(and(eq(characterAchievements.characterId, char.id), eq(characterAchievements.achievementId, ach.id)))
    .limit(1)

  if (!ca || !ca.completed) throw createError({ statusCode: 400, message: '成就未完成' })
  if (ca.claimed) throw createError({ statusCode: 409, message: '已领取过奖励' })

  // Fetch material rewards from DB config
  const [configDef] = await db.select().from(configAchievementDefs).where(eq(configAchievementDefs.key, achievementKey)).limit(1)
  const materialRewards: { id: string; qty: number }[] = configDef?.materialRewardsJson ? JSON.parse(configDef.materialRewardsJson) : []

  const newLingshi = parseFloat(char.lingshi) + ach.rewardValue
  await db.update(characters).set({ lingshi: String(newLingshi) }).where(eq(characters.id, char.id))

  for (const mat of materialRewards) {
    const [inv] = await db.select().from(inventory)
      .where(and(eq(inventory.characterId, char.id), eq(inventory.itemId, mat.id))).limit(1)
    if (inv) {
      await db.update(inventory).set({ quantity: inv.quantity + mat.qty }).where(eq(inventory.id, inv.id))
    } else {
      await db.insert(inventory).values({ characterId: char.id, itemType: 'material', itemId: mat.id, quantity: mat.qty })
    }
  }

  await db.update(characterAchievements).set({ claimed: 1 }).where(eq(characterAchievements.id, ca.id))

  return { success: true, reward: ach.rewardValue, message: `获得 ${ach.rewardValue} 灵石${materialRewards.length ? ' + 材料' : ''}` }
})