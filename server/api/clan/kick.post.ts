import { eq } from 'drizzle-orm'
import { characters, clans, clanMembers } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const { memberId } = await readBody(event) || {}
  const db = useDB()

  const [char] = await db.select().from(characters).where(eq(characters.userId, userId))
  if (!char) throw createError({ statusCode: 404, message: '角色不存在' })

  const [myMember] = await db.select().from(clanMembers).where(eq(clanMembers.characterId, char.id)).limit(1)
  if (!myMember) throw createError({ statusCode: 400, message: '未加入宗门' })
  if (myMember.role !== 'leader') throw createError({ statusCode: 403, message: '仅宗主可踢出成员' })

  const [target] = await db.select().from(clanMembers).where(eq(clanMembers.id, memberId)).limit(1)
  if (!target || target.clanId !== myMember.clanId) throw createError({ statusCode: 404, message: '成员不存在' })
  if (target.role === 'leader') throw createError({ statusCode: 400, message: '不能踢出宗主' })

  await db.delete(clanMembers).where(eq(clanMembers.id, target.id))

  const [clan] = await db.select().from(clans).where(eq(clans.id, myMember.clanId)).limit(1)
  if (clan) await db.update(clans).set({ memberCount: clan.memberCount - 1 }).where(eq(clans.id, clan.id))

  return { success: true }
})
