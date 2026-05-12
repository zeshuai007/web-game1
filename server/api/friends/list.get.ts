import { eq, or, and, sql } from 'drizzle-orm'
import { characters, friendRequests } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const db = useDB()

  const char = await useCharacter(event)

  const requests = await db.select()
    .from(friendRequests)
    .where(and(
      or(eq(friendRequests.fromCharacterId, char.id), eq(friendRequests.toCharacterId, char.id)),
      eq(friendRequests.status, 'accepted'),
    ))

  // Get friend ids + character info
  const friendIds = requests.map(r =>
    r.fromCharacterId === char.id ? r.toCharacterId : r.fromCharacterId
  )

  const friends = friendIds.length
    ? await db.select({ id: characters.id, nickname: characters.nickname, realm: characters.realm, realmLayer: characters.realmLayer })
        .from(characters)
        .where(sql`${characters.id} IN (${friendIds.join(',')})`)
    : []

  const result = requests.map(r => {
    const friendId = r.fromCharacterId === char.id ? r.toCharacterId : r.fromCharacterId
    const info = friends.find(f => f.id === friendId)
    return { id: r.id, friendId, nickname: info?.nickname || '未知', realm: info?.realm || '', realmLayer: info?.realmLayer || 0 }
  })

  return { friends: result }
})
