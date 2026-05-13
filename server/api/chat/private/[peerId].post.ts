import { and, eq } from 'drizzle-orm'

import { characters, chatMessages } from '../../../db/schema'
import { createChatMessage, validateChatContent } from '../../../utils/chat-engine'
import { publishPrivateMessage } from '../../../utils/pusher'

export default defineEventHandler(async (event) => {
  const peerId = getRouterParam(event, 'peerId')
  if (!peerId) {
    throw createError({ statusCode: 400, message: '缺少私聊对象' })
  }

  const body = await readBody(event)
  const validation = validateChatContent(body?.content)
  if (!validation.ok) {
    throw createError({ statusCode: 400, message: validation.message })
  }

  const db = useDB()
  const character = await useCharacter(event)
  if (peerId === character.id) {
    throw createError({ statusCode: 400, message: '不能给自己发送私聊' })
  }

  const [peer] = await db.select({
    id: characters.id,
  }).from(characters).where(eq(characters.id, peerId)).limit(1)

  if (!peer) {
    throw createError({ statusCode: 404, message: '私聊对象不存在' })
  }

  const [inserted] = await db.insert(chatMessages).values({
    fromCharacterId: character.id,
    toCharacterId: peerId,
    content: validation.content,
  }).returning()

  const message = {
    ...createChatMessage({
      actor: character,
      content: inserted.content,
      timestamp: inserted.createdAt.getTime(),
    }),
    id: inserted.id,
  }

  await publishPrivateMessage(peerId, message)

  return {
    ok: true,
    message,
  }
})
