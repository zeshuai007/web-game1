import { realmLabels, type Realm } from '../db/schema'

const WORLD_CHAT_LIMIT = 3
const WORLD_CHAT_WINDOW_MS = 10_000

type Speaker = {
  id: string
  nickname: string
  realm: string
  realmLayer: number
}

export function canSpeakInWorld(actor: Pick<Speaker, 'realm' | 'realmLayer'>) {
  if (actor.realm !== 'condensing_qi') return true
  return actor.realmLayer >= 3
}

export function validateChatContent(content: string) {
  const normalized = String(content ?? '').trim()
  if (!normalized) {
    return { ok: false as const, message: '消息内容不能为空' }
  }

  if (normalized.length > 200) {
    return { ok: false as const, message: '消息不能超过200字' }
  }

  return { ok: true as const, content: normalized }
}

export function consumeWorldChatRateLimit(timestamps: number[], now = Date.now()) {
  const active = timestamps.filter(timestamp => now - timestamp <= WORLD_CHAT_WINDOW_MS)
  if (active.length >= WORLD_CHAT_LIMIT) {
    return {
      allowed: false as const,
      timestamps: active,
      retryAfterMs: WORLD_CHAT_WINDOW_MS - (now - active[0]),
    }
  }

  return {
    allowed: true as const,
    timestamps: [...active, now],
  }
}

export function formatRealmTag(realm: string, realmLayer: number) {
  const label = realmLabels[realm as Realm] || realm
  if (realm === 'condensing_qi') {
    return `${label}${toChineseLayer(realmLayer)}层`
  }

  const stage = realmLayer === 1 ? '初期' : realmLayer === 2 ? '中期' : '后期'
  return `${label}${stage}`
}

export function createChatMessage({ actor, content, timestamp = Date.now() }: {
  actor: Speaker
  content: string
  timestamp?: number
}) {
  return {
    type: 'chat' as const,
    from: {
      id: actor.id,
      nickname: actor.nickname,
    },
    content,
    timestamp,
    realm: formatRealmTag(actor.realm, actor.realmLayer),
  }
}

export function createSystemMessage(content: string, timestamp = Date.now()) {
  return {
    type: 'system' as const,
    content,
    timestamp,
  }
}

function toChineseLayer(layer: number) {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  if (layer <= 10) {
    if (layer === 10) return '十'
    return digits[layer] || String(layer)
  }

  return String(layer)
}
