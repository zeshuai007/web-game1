import { eq } from 'drizzle-orm'
import { characters, clans, clanMembers } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const db = useDB()

  const [char] = await db.select().from(characters).where(eq(characters.userId, userId))
  if (!char) throw createError({ statusCode: 404, message: '角色不存在' })

  const [member] = await db.select().from(clanMembers).where(eq(clanMembers.characterId, char.id)).limit(1)
  if (!member) throw createError({ statusCode: 400, message: '未加入宗门' })
  if (member.role === 'leader') throw createError({ statusCode: 400, message: '宗主不能退出，请先转让宗主' })

  await db.delete(clanMembers).where(eq(clanMembers.id, member.id))

  const [clan] = await db.select().from(clans).where(eq(clans.id, member.clanId)).limit(1)
  if (clan) await db.update(clans).set({ memberCount: clan.memberCount - 1 }).where(eq(clans.id, clan.id))

  return { success: true }
})
