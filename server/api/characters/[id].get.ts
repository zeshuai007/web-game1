import { eq } from 'drizzle-orm'
import { characters, realmLabels, type Realm } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const id = getRouterParam(event, 'id')
  const db = useDB()

  // Verify the requester exists
  const [me] = await db.select().from(characters).where(eq(characters.userId, userId))
  if (!me) throw createError({ statusCode: 404, message: '角色不存在' })

  const [char] = await db.select({
    id: characters.id, nickname: characters.nickname, realm: characters.realm, realmLayer: characters.realmLayer,
  }).from(characters).where(eq(characters.id, id)).limit(1)

  if (!char) throw createError({ statusCode: 404, message: '角色不存在' })

  return { ...char, realm: realmLabels[char.realm as Realm] || char.realm }
})
