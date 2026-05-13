import { and, eq } from 'drizzle-orm'

import { chatMessages, chatReadStates, characters } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const db = useDB()
  const character = await useCharacter(event)

  const [messages, readStates] = await Promise.all([
    db.select().from(chatMessages).where(eq(chatMessages.toCharacterId, character.id)),
    db.select().from(chatReadStates).where(eq(chatReadStates.characterId, character.id)),
  ])

  const readStateMap = new Map(readStates.map(state => [state.peerCharacterId, state.lastReadAt]))
  const unreadByPeer = new Map<string, number>()

  for (const message of messages) {
    const lastReadAt = readStateMap.get(message.fromCharacterId)
    if (lastReadAt && message.createdAt <= lastReadAt) continue
    unreadByPeer.set(message.fromCharacterId, (unreadByPeer.get(message.fromCharacterId) || 0) + 1)
  }

  const peerIds = [...unreadByPeer.keys()]
  const peers = await Promise.all(
    peerIds.map(async (peerId) => {
      const [peer] = await db.select({
        id: characters.id,
        nickname: characters.nickname,
      }).from(characters).where(eq(characters.id, peerId)).limit(1)

      return peer
    }),
  )

  const conversations = peerIds.map((peerId) => {
    const peer = peers.find(item => item?.id === peerId)
    return {
      characterId: peerId,
      nickname: peer?.nickname || '未知道友',
      unreadCount: unreadByPeer.get(peerId) || 0,
    }
  })

  return {
    total: conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0),
    conversations,
  }
})
