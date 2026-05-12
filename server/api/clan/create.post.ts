import { eq } from 'drizzle-orm'
import { characters, clans, clanMembers } from '../../db/schema'
import { getClanLevelBonus, realmConfigs } from '../../utils/game-engine'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const { name, description } = await readBody(event) || {}
  const db = useDB()

  if (!name || name.trim().length < 2) throw createError({ statusCode: 400, message: '宗门名称至少2个字符' })
  if (name.length > 20) throw createError({ statusCode: 400, message: '宗门名称不超过20个字符' })

  const char = await useCharacter(event)

  // Check if already in a clan
  const [existingMember] = await db.select().from(clanMembers).where(eq(clanMembers.characterId, char.id)).limit(1)
  if (existingMember) throw createError({ statusCode: 409, message: '已加入宗门' })

  // Cost: 500 lingshi
  const lingshi = parseFloat(char.lingshi)
  if (lingshi < 500) throw createError({ statusCode: 400, message: '创建宗门需要500灵石' })

  await db.update(characters).set({ lingshi: String(lingshi - 500) }).where(eq(characters.id, char.id))

  const [clan] = await db.insert(clans).values({
    name: name.trim(),
    description: description || '',
    leaderCharacterId: char.id,
  }).returning()

  await db.insert(clanMembers).values({ clanId: clan.id, characterId: char.id, role: 'leader' })

  return { clan, bonus: getClanLevelBonus(1) }
})
