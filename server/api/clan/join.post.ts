import { eq } from 'drizzle-orm'
import { characters, clans, clanMembers } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const { clanId } = await readBody(event) || {}
  const db = useDB()

  const char = await useCharacter(event)

  const [existing] = await db.select().from(clanMembers).where(eq(clanMembers.characterId, char.id)).limit(1)
  if (existing) throw createError({ statusCode: 409, message: '已加入宗门' })

  const [clan] = await db.select().from(clans).where(eq(clans.id, clanId)).limit(1)
  if (!clan) throw createError({ statusCode: 404, message: '宗门不存在' })

  await db.insert(clanMembers).values({ clanId, characterId: char.id, role: 'member' })
  await db.update(clans).set({ memberCount: clan.memberCount + 1 }).where(eq(clans.id, clanId))

  return { role: 'member' }
})
