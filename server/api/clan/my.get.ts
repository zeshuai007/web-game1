import { eq } from 'drizzle-orm'
import { characters, clans, clanMembers } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const db = useDB()

  const char = await useCharacter(event)

  const [member] = await db.select().from(clanMembers).where(eq(clanMembers.characterId, char.id)).limit(1)
  if (!member) throw createError({ statusCode: 404, message: '未加入宗门' })

  const [clan] = await db.select().from(clans).where(eq(clans.id, member.clanId)).limit(1)
  if (!clan) throw createError({ statusCode: 404, message: '宗门不存在' })

  const members = await db.select({
    id: clanMembers.id, characterId: clanMembers.characterId, role: clanMembers.role,
    contributedExp: clanMembers.contributedExp, joinedAt: clanMembers.joinedAt,
    nickname: characters.nickname, realm: characters.realm, realmLayer: characters.realmLayer,
  }).from(clanMembers).innerJoin(characters, eq(clanMembers.characterId, characters.id))

  return { clan, role: member.role, members }
})
