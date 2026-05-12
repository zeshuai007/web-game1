import { eq, and } from 'drizzle-orm'
import { characters, clanMembers, clanTasks, clanTaskProgress } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const { taskId, amount = 1 } = await readBody(event) || {}
  const db = useDB()

  const char = await useCharacter(event)

  const [member] = await db.select().from(clanMembers).where(eq(clanMembers.characterId, char.id)).limit(1)
  if (!member) throw createError({ statusCode: 400, message: '未加入宗门' })

  const [task] = await db.select().from(clanTasks).where(eq(clanTasks.id, taskId)).limit(1)
  if (!task) throw createError({ statusCode: 404, message: '任务不存在' })

  const [progress] = await db.select().from(clanTaskProgress)
    .where(and(eq(clanTaskProgress.clanTaskId, taskId), eq(clanTaskProgress.characterId, char.id)))
    .limit(1)

  if (progress?.claimedAt) throw createError({ statusCode: 409, message: '已领取过奖励' })

  const newProgress = (progress?.progress || 0) + amount
  const completed = newProgress >= task.targetCount ? 1 : 0

  if (progress) {
    await db.update(clanTaskProgress).set({ progress: newProgress, completed })
      .where(eq(clanTaskProgress.id, progress.id))
  } else {
    await db.insert(clanTaskProgress).values({ clanTaskId: taskId, characterId: char.id, progress: newProgress, completed })
  }

  return { progress: newProgress, completed, targetCount: task.targetCount }
})
