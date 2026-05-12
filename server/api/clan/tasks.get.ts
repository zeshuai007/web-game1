import { eq, sql, and, inArray } from 'drizzle-orm'
import { characters, clanMembers, clanTasks, clanTaskProgress } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const db = useDB()

  const [char] = await db.select().from(characters).where(eq(characters.userId, userId))
  if (!char) throw createError({ statusCode: 404, message: '角色不存在' })

  const [member] = await db.select().from(clanMembers).where(eq(clanMembers.characterId, char.id)).limit(1)
  if (!member) throw createError({ statusCode: 400, message: '未加入宗门' })

  const today = new Date().toISOString().slice(0, 10)

  // Get or create today's tasks
  let tasks = await db.select().from(clanTasks).where(eq(clanTasks.taskDate, today)).limit(4)

  if (tasks.length === 0) {
    const { dailyClanTasks } = await import('../../utils/game-engine')
    for (const t of dailyClanTasks) {
      const [task] = await db.insert(clanTasks).values({ ...t, taskDate: today }).returning()
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
