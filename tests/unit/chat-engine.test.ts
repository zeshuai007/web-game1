import { describe, expect, it } from 'vitest'

import {
  consumeWorldChatRateLimit,
  createChatMessage,
  createSystemMessage,
  formatRealmTag,
  validateChatContent,
  canSpeakInWorld,
} from '../../server/utils/chat-engine'

describe('chat-engine', () => {
  it('凝气期三层以上才能在世界频道发言', () => {
    expect(canSpeakInWorld({ realm: 'condensing_qi', realmLayer: 2 })).toBe(false)
    expect(canSpeakInWorld({ realm: 'condensing_qi', realmLayer: 3 })).toBe(true)
    expect(canSpeakInWorld({ realm: 'foundation', realmLayer: 1 })).toBe(true)
  })

  it('聊天内容需要去空白且限制 200 字', () => {
    expect(validateChatContent('   ')).toEqual({ ok: false, message: '消息内容不能为空' })
    expect(validateChatContent('  道友留步  ')).toEqual({ ok: true, content: '道友留步' })
    expect(validateChatContent('a'.repeat(201))).toEqual({ ok: false, message: '消息不能超过200字' })
  })

  it('世界频道 10 秒内最多 3 条消息', () => {
    const start = 1_700_000_000_000

    const first = consumeWorldChatRateLimit([], start)
    expect(first.allowed).toBe(true)
    expect(first.timestamps).toEqual([start])

    const second = consumeWorldChatRateLimit(first.timestamps, start + 1000)
    const third = consumeWorldChatRateLimit(second.timestamps, start + 2000)
    const fourth = consumeWorldChatRateLimit(third.timestamps, start + 3000)

    expect(fourth.allowed).toBe(false)
    expect(fourth.retryAfterMs).toBeGreaterThan(0)

    const afterWindow = consumeWorldChatRateLimit(third.timestamps, start + 10_001)
    expect(afterWindow.allowed).toBe(true)
    expect(afterWindow.timestamps).toEqual([start + 1000, start + 2000, start + 10_001])
  })

  it('世界聊天和系统广播使用统一消息信封', () => {
    const world = createChatMessage({
      actor: {
        id: 'char-1',
        nickname: '韩立',
        realm: 'foundation',
        realmLayer: 2,
      },
      content: '诸位道友安好',
      timestamp: 123,
    })

    expect(world).toEqual({
      type: 'chat',
      from: { id: 'char-1', nickname: '韩立' },
      content: '诸位道友安好',
      timestamp: 123,
      realm: '筑基期中期',
    })

    expect(createSystemMessage('【系统】韩立突破至结丹期！', 456)).toEqual({
      type: 'system',
      content: '【系统】韩立突破至结丹期！',
      timestamp: 456,
    })

    expect(formatRealmTag('condensing_qi', 5)).toBe('凝气期五层')
  })
})
