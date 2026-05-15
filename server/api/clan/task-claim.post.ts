import { eq, and } from 'drizzle-orm'
import { characters, clans, clanMembers, clanTasks, clanTaskProgress } from '../../db/schema'
import { getClanLevelsFromDB } from '../../utils/config'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const { taskId } = await readBody(event) || {}
  const db = useDB()

  const char = await useCharacter(event)

  const [member] = await db.select().from(clanMembers).where(eq(clanMembers.characterId, char.id)).limit(1)
  if (!member) throw createError({ statusCode: 400, message: '未加入宗门' })

  const [progress] = await db.select().from(clanTaskProgress)
    .where(and(eq(clanTaskProgress.clanTaskId, taskId), eq(clanTaskProgress.characterId, char.id)))
    .limit(1)

  if (!progress || !progress.completed) throw createError({ statusCode: 400, message: '任务未完成' })
  if (progress.claimedAt) throw createError({ statusCode: 409, message: '已领取过奖励' })

  const [task] = await db.select().from(clanTasks).where(eq(clanTasks.id, taskId)).limit(1)
  if (!task) throw createError({ statusCode: 404, message: '任务不存在' })

  // Add contribution + clan exp
  await db.update(clanMembers).set({
    contributedExp: member.contributedExp + task.rewardContribution,
  }).where(eq(clanMembers.id, member.id))

  const [clan] = await db.select().from(clans).where(eq(clans.id, member.clanId)).limit(1)
  if (clan) {
    const newExp = clan.exp + task.rewardExp
    // Check level up using DB config
    const clanLevels = await getClanLevelsFromDB(db)
    const nextLevelConfig = clanLevels.find(l => l.level === clan.level)
    const nextLevelExp = nextLevelConfig ? nextLevelConfig.expRequired : 999999
    if (newExp >= nextLevelExp && clan.level < 10) {
      await db.update(clans).set({ exp: newExp - nextLevelExp, level: clan.level + 1 }).where(eq(clans.id, clan.id))
    } else {
      await db.update(clans).set({ exp: newExp }).where(eq(clans.id, clan.id))
    }
  }

  await db.update(clanTaskProgress).set({ claimedAt: new Date() }).where(eq(clanTaskProgress.id, progress.id))

  return { success: true, rewardExp: task.rewardExp, rewardContribution: task.rewardContribution }
})