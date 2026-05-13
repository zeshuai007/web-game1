import { and, asc, desc, eq, or } from 'drizzle-orm'

import { chatMessages, chatReadStates, characters } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const peerId = getRouterParam(event, 'peerId')
  if (!peerId) {
    throw createError({ statusCode: 400, message: '缺少私聊对象' })
  }

  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit || 50) || 50, 1), 50)

  const db = useDB()
  const character = await useCharacter(event)

  const [peer] = await db.select({
    id: characters.id,
    nickname: characters.nickname,
  }).from(characters).where(eq(characters.id, peerId)).limit(1)

  if (!peer) {
    throw createError({ statusCode: 404, message: '私聊对象不存在' })
  }

  const allMessages = await db.select().from(chatMessages)
    .where(or(
      and(eq(chatMessages.fromCharacterId, character.id), eq(chatMessages.toCharacterId, peerId)),
      and(eq(chatMessages.fromCharacterId, peerId), eq(chatMessages.toCharacterId, character.id)),
    ))
    .orderBy(desc(chatMessages.createdAt))

  const cursorId = typeof query.cursor === 'string' && query.cursor ? query.cursor : null
  let messages = allMessages
  if (cursorId) {
    const cursorIndex = allMessages.findIndex(message => message.id === cursorId)
    if (cursorIndex >= 0) {
      messages = allMessages.slice(cursorIndex + 1)
    }
  }

  const page = messages.slice(0, limit)
  const items = [...page].reverse().map(message => ({
    id: message.id,
    type: 'chat' as const,
    from: {
      id: message.fromCharacterId,
      nickname: message.fromCharacterId === character.id ? character.nickname : peer.nickname,
    },
    content: message.content,
    timestamp: message.createdAt.getTime(),
  }))

  const latestSeenAt = page
    .filter(message => message.toCharacterId === character.id)
    .reduce<Date | null>((latest, message) => {
      if (!latest || message.createdAt > latest) return message.createdAt
      return latest
    }, null)

  if (latestSeenAt) {
    const [existing] = await db.select()
      .from(chatReadStates)
      .where(and(eq(chatReadStates.characterId, character.id), eq(chatReadStates.peerCharacterId, peerId)))
      .limit(1)

    if (existing) {
      await db.update(chatReadStates)
        .set({ lastReadAt: latestSeenAt, updatedAt: new Date() })
        .where(eq(chatReadStates.id, existing.id))
    } else {
      await db.insert(chatReadStates).values({
        characterId: character.id,
        peerCharacterId: peerId,
        lastReadAt: latestSeenAt,
      })
    }
  }

  return {
    items,
    nextCursor: page.length === limit ? page[page.length - 1]?.id ?? null : null,
  }
})
