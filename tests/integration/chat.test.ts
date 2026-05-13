import { beforeAll, describe, expect, it } from 'vitest'

const BASE = 'http://localhost:3000'

describe('Chat API', () => {
  const ts = Date.now()
  const email = `chat_${ts}@vitest.com`
  const password = 'test123456'
  let token = ''
  let characterId = ''

  async function registerUser(suffix: string, nickname: string) {
    const register = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `chat_${suffix}_${Date.now()}@vitest.com`,
        password,
        nickname,
      }),
    })
    const registerBody = await register.json()

    const me = await fetch(`${BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${registerBody.token}` },
    })
    const meBody = await me.json()

    return {
      token: registerBody.token as string,
      characterId: meBody.character.id as string,
    }
  }

  beforeAll(async () => {
    const register = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nickname: '聊天测试' }),
    })

    const body = await register.json()
    token = body.token

    const me = await fetch(`${BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const meBody = await me.json()
    characterId = meBody.character.id
  })

  it('POST /api/pusher/auth - returns presence auth payload for world channel', async () => {
    const res = await fetch(`${BASE}/api/pusher/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        socket_id: '1234.5678',
        channel_name: 'presence-world',
      }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.auth).toContain(':')
    expect(JSON.parse(body.channel_data)).toMatchObject({
      user_id: characterId,
      user_info: {
        nickname: '聊天测试',
      },
    })
  })

  it('POST /api/pusher/auth - rejects subscribing another player private channel', async () => {
    const res = await fetch(`${BASE}/api/pusher/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        socket_id: '1234.5678',
        channel_name: 'private-user-other-player',
      }),
    })

    expect(res.status).toBe(403)
  })

  it('POST /api/chat/world - rejects speakers below 凝气期三层', async () => {
    const setup = await fetch(`${BASE}/api/test/char-resource`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        characterId,
        realm: 'condensing_qi',
        realmLayer: 2,
      }),
    })
    expect(setup.status).toBe(200)

    const res = await fetch(`${BASE}/api/chat/world`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: '诸位道友安好' }),
    })

    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.message).toContain('凝气期第3层以上')
  })

  it('POST /api/chat/world - accepts speakers above threshold and returns unified message envelope', async () => {
    const setup = await fetch(`${BASE}/api/test/char-resource`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        characterId,
        realm: 'foundation',
        realmLayer: 2,
      }),
    })
    expect(setup.status).toBe(200)

    const res = await fetch(`${BASE}/api/chat/world`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: ' 诸位道友安好 ' }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.message).toMatchObject({
      type: 'chat',
      content: '诸位道友安好',
      from: {
        id: characterId,
        nickname: '聊天测试',
      },
      realm: '筑基期中期',
    })
  })

  it('POST /api/chat/world - rate limits the fourth message in ten seconds', async () => {
    const chatter = await registerUser('limit', '限流测试')

    const setup = await fetch(`${BASE}/api/test/char-resource`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${chatter.token}`,
      },
      body: JSON.stringify({
        characterId: chatter.characterId,
        realm: 'foundation',
        realmLayer: 2,
      }),
    })
    expect(setup.status).toBe(200)

    for (let index = 0; index < 3; index += 1) {
      const res = await fetch(`${BASE}/api/chat/world`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${chatter.token}`,
        },
        body: JSON.stringify({ content: `第${index + 1}条消息` }),
      })
      expect(res.status).toBe(200)
    }

    const fourth = await fetch(`${BASE}/api/chat/world`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${chatter.token}`,
      },
      body: JSON.stringify({ content: '第4条消息' }),
    })

    expect(fourth.status).toBe(429)
    const body = await fourth.json()
    expect(body.message).toContain('发言过于频繁')
  })

  it('private chat persists messages, reports unread count, and clears unread after reading history', async () => {
    const sender = await registerUser('sender', '私聊甲')
    const receiver = await registerUser('receiver', '私聊乙')

    const send = await fetch(`${BASE}/api/chat/private/${receiver.characterId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sender.token}`,
      },
      body: JSON.stringify({ content: '道友可愿交换丹方？' }),
    })

    expect(send.status).toBe(200)
    const sendBody = await send.json()
    expect(sendBody.message).toMatchObject({
      type: 'chat',
      content: '道友可愿交换丹方？',
      from: {
        id: sender.characterId,
        nickname: '私聊甲',
      },
    })

    const unread = await fetch(`${BASE}/api/chat/unread`, {
      headers: { Authorization: `Bearer ${receiver.token}` },
    })

    expect(unread.status).toBe(200)
    const unreadBody = await unread.json()
    expect(unreadBody.total).toBe(1)
    expect(unreadBody.conversations).toEqual([
      expect.objectContaining({
        characterId: sender.characterId,
        nickname: '私聊甲',
        unreadCount: 1,
      }),
    ])

    const history = await fetch(`${BASE}/api/chat/private/${sender.characterId}`, {
      headers: { Authorization: `Bearer ${receiver.token}` },
    })

    expect(history.status).toBe(200)
    const historyBody = await history.json()
    expect(historyBody.items).toHaveLength(1)
    expect(historyBody.items[0]).toMatchObject({
      type: 'chat',
      content: '道友可愿交换丹方？',
      from: {
        id: sender.characterId,
        nickname: '私聊甲',
      },
    })

    const unreadAfterRead = await fetch(`${BASE}/api/chat/unread`, {
      headers: { Authorization: `Bearer ${receiver.token}` },
    })

    expect(unreadAfterRead.status).toBe(200)
    const afterBody = await unreadAfterRead.json()
    expect(afterBody.total).toBe(0)
    expect(afterBody.conversations).toEqual([])
  })

  it('major breakthrough returns a system broadcast envelope for world channel', async () => {
    const cultivator = await registerUser('breakthrough', '韩立')

    const setup = await fetch(`${BASE}/api/test/char-resource`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cultivator.token}`,
      },
      body: JSON.stringify({
        characterId: cultivator.characterId,
        realm: 'condensing_qi',
        realmLayer: 9,
        lingqi: 150,
        lingqiCap: 150,
        breakthroughFailureCount: 0,
      }),
    })
    expect(setup.status).toBe(200)

    const breakthrough = await fetch(`${BASE}/api/cultivate/breakthrough`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cultivator.token}`,
        'x-test-breakthrough-roll': '0.01',
      },
      body: JSON.stringify({ usePill: false }),
    })

    expect(breakthrough.status).toBe(200)
    const body = await breakthrough.json()
    expect(body.success).toBe(true)
    expect(body.worldBroadcast).toMatchObject({
      type: 'system',
      content: '【系统】韩立突破至筑基期！',
    })
  })
})
