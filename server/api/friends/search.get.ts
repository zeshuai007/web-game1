import { eq, and, ilike, sql, inArray, or } from 'drizzle-orm'
import { characters, friendRequests, realmLabels, type Realm } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const query = getQuery(event)
  const q = (query.q as string || '').trim()
  const db = useDB()

  const [me] = await db.select().from(characters).where(eq(characters.userId, userId))
  if (!me) throw createError({ statusCode: 404, message: '角色不存在' })

  if (!q) return { results: [] }

  const results = await db.select({
    id: characters.id,
    nickname: characters.nickname,
    realm: characters.realm,
    realmLayer: characters.realmLayer,
  })
    .from(characters)
    .where(sql`${characters.nickname} ILIKE ${'%' + q + '%'} AND ${characters.id} != ${me.id}`)
    .limit(20)

  // Filter out existing friends/pending
  const charIds = results.map(r => r.id)
  const existing = charIds.length
    ? await db.select().from(friendRequests)
      .where(or(
        and(eq(friendRequests.fromCharacterId, me.id), inArray(friendRequests.toCharacterId, charIds)),
        and(eq(friendRequests.toCharacterId, me.id), inArray(friendRequests.fromCharacterId, charIds)),
      ))
    : []

  const existingIds = new Set(existing.flatMap(r => [r.fromCharacterId, r.toCharacterId]))
  const filtered = results.filter(r => !existingIds.has(r.id))

  return { results: filtered.map(r => ({ ...r, realm: realmLabels[r.realm as Realm] || r.realm })) }
})
