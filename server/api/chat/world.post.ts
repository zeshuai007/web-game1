import {
  canSpeakInWorld,
  consumeWorldChatRateLimit,
  createChatMessage,
  validateChatContent,
} from '../../utils/chat-engine'
import { publishWorldMessage } from '../../utils/pusher'

declare global {
  var __xianniWorldChatLimiter: Map<string, number[]> | undefined
}

function useWorldLimiter() {
  if (!globalThis.__xianniWorldChatLimiter) {
    globalThis.__xianniWorldChatLimiter = new Map()
  }

  return globalThis.__xianniWorldChatLimiter
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validation = validateChatContent(body?.content)
  if (!validation.ok) {
    throw createError({ statusCode: 400, message: validation.message })
  }

  const character = await useCharacter(event)
  if (!canSpeakInWorld(character)) {
    throw createError({ statusCode: 403, message: '凝气期第3层以上方可发言' })
  }

  const limiter = useWorldLimiter()
  const current = limiter.get(character.id) || []
  const rateLimit = consumeWorldChatRateLimit(current)
  if (!rateLimit.allowed) {
    limiter.set(character.id, rateLimit.timestamps)
    throw createError({ statusCode: 429, message: '发言过于频繁，请稍后再试' })
  }

  limiter.set(character.id, rateLimit.timestamps)

  const message = createChatMessage({
    actor: character,
    content: validation.content,
  })

  await publishWorldMessage(message)

  return {
    ok: true,
    message,
  }
})
