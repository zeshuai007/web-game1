import { eq, and, inArray } from 'drizzle-orm'
import { characters, clanMembers, clanTasks, clanTaskProgress } from '../../db/schema'
import { getClanDailyTasksFromDB } from '../../utils/config'

export default defineEventHandler(async (event) => {
  const db = useDB()

  const char = await useCharacter(event)

  const [member] = await db.select().from(clanMembers).where(eq(clanMembers.characterId, char.id)).limit(1)
  if (!member) throw createError({ statusCode: 400, message: '未加入宗门' })

  const today = new Date().toISOString().slice(0, 10)

  // Get or create today's tasks
  let tasks = await db.select().from(clanTasks).where(eq(clanTasks.taskDate, today)).limit(4)

  if (tasks.length === 0) {
    const dailyTasks = await getClanDailyTasksFromDB(db)
    for (const t of dailyTasks) {
      const [task] = await db.insert(clanTasks).values({
        taskType: t.taskType,
        title: t.title,
        description: t.description,
        targetCount: t.targetCount,
        rewardExp: t.rewardExp,
        rewardContribution: t.rewardContribution,
        taskDate: today,
      }).returning()
      tasks.push(task)
    }
  }

  // Get character's progress
  const taskIds = tasks.map(t => t.id)
  const progressList = taskIds.length
    ? await db.select().from(clanTaskProgress)
      .where(and(
        eq(clanTaskProgress.characterId, char.id),
        inArray(clanTaskProgress.clanTaskId, taskIds),
      ))
    : []

  const progressMap = new Map(progressList.map(p => [p.clanTaskId, p]))

  return {
    tasks: tasks.map(t => {
      const prog = progressMap.get(t.id)
      return {
        id: t.id, taskType: t.taskType, title: t.title, description: t.description,
        targetCount: t.targetCount, rewardExp: t.rewardExp, rewardContribution: t.rewardContribution,
        progress: prog?.progress || 0, completed: prog?.completed || 0, claimed: !!prog?.claimedAt,
      }
    }),
  }
})