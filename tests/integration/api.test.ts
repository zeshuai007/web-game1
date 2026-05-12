import { describe, it, expect, beforeAll, afterAll } from 'vitest'

const BASE = 'http://localhost:3000'

function checkServerRunning() {
  try {
    // can't use fetch at top level in describe, will check in beforeAll
    return true
  } catch {
    return false
  }
}

describe('Auth API', () => {
  const testEmail = `test_${Date.now()}@vitest.com`
  const testPw = 'test123456'
  let token = ''

  it('POST /api/auth/register - creates new user', async () => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPw, nickname: 'Test' }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.token).toBeTruthy()
    expect(body.userId).toBeTruthy()
    token = body.token
  })

  it('POST /api/auth/register - rejects duplicate email', async () => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPw }),
    })
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.message).toContain('已注册')
  })

  it('POST /api/auth/register - rejects short password', async () => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com', password: '123' }),
    })
    expect(res.status).toBe(400)
  })

  it('POST /api/auth/register - rejects invalid email', async () => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'notanemail', password: testPw }),
    })
    expect(res.status).toBe(400)
  })

  it('POST /api/auth/login - succeeds with correct credentials', async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPw }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.token).toBeTruthy()
    token = body.token
  })

  it('POST /api/auth/login - rejects wrong password', async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'wrongpw' }),
    })
    expect(res.status).toBe(401)
  })

  it('GET /api/auth/me - returns user profile with character', async () => {
    const res = await fetch(`${BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.user.email).toBe(testEmail)
    expect(body.character.nickname).toBe('Test')
    expect(body.character.realm).toBe('condensing_qi')
    expect(body.character.realmLayer).toBe(1)
  })

  it('GET /api/auth/me - rejects without token', async () => {
    const res = await fetch(`${BASE}/api/auth/me`)
    expect(res.status).toBe(401)
  })
})

describe('Cultivation API', () => {
  let token = ''
  const testEmail = `cult_${Date.now()}@vitest.com`

  beforeAll(async () => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'test123456' }),
    })
    const body = await res.json()
    token = body.token
  })

  it('GET /api/cultivate/progress - returns character state', async () => {
    const res = await fetch(`${BASE}/api/cultivate/progress`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.character).toBeDefined()
    expect(body.character.lingqi).toBeDefined()
    expect(body.realmConfig).toBeDefined()
  })

  it('POST /api/cultivate/breakthrough - fails when lingqi not full', async () => {
    const res = await fetch(`${BASE}/api/cultivate/breakthrough`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ usePill: false }),
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.message).toContain('尚未圆满')
  })
})

describe('Shop API', () => {
  let token = ''
  const testEmail = `shop_${Date.now()}@vitest.com`

  beforeAll(async () => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'test123456' }),
    })
    const body = await res.json()
    token = body.token
  })

  it('GET /api/shop/items - returns all items', async () => {
    const res = await fetch(`${BASE}/api/shop/items`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.items.length).toBe(6)
    expect(body.items[0].id).toBe('youhun_cao')
    expect(body.items[0].price).toBeGreaterThan(0)
  })

  it('POST /api/shop/buy - fails with insufficient lingshi', async () => {
    const res = await fetch(`${BASE}/api/shop/buy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ itemId: 'youhun_cao', quantity: 1 }),
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.message).toContain('灵石不足')
  })
})

describe('Alchemy API', () => {
  let token = ''
  const testEmail = `alch_${Date.now()}@vitest.com`

  beforeAll(async () => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'test123456' }),
    })
    const body = await res.json()
    token = body.token
  })

  it('GET /api/alchemy/list - returns recipes', async () => {
    const res = await fetch(`${BASE}/api/alchemy/list`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.recipes.length).toBe(13)
    const peiyuan = body.recipes.find((r: any) => r.id === 'peiyuan_dan')
    expect(peiyuan).toBeDefined()
    expect(peiyuan.type).toBe('cultivation')
    expect(peiyuan.materials.length).toBe(2)
  })

  it('POST /api/alchemy/refine - fails without materials', async () => {
    const res = await fetch(`${BASE}/api/alchemy/refine`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ pillType: 'peiyuan_dan' }),
    })
    expect(res.status).toBe(400)
  })
})

describe('Rankings API', () => {
  let token = ''
  const testEmail = `rank_${Date.now()}@vitest.com`

  beforeAll(async () => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'test123456' }),
    })
    const body = await res.json()
    token = body.token
  })

  it('GET /api/rankings - returns list', async () => {
    const res = await fetch(`${BASE}/api/rankings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.rankings)).toBe(true)
  })
})

describe('Profile API', () => {
  let token = ''
  const testEmail = `prof_${Date.now()}@vitest.com`

  beforeAll(async () => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'test123456', nickname: '原道号' }),
    })
    const body = await res.json()
    token = body.token
  })

  it('PUT /api/auth/profile - updates nickname', async () => {
    const res = await fetch(`${BASE}/api/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nickname: '新道号' }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.character.nickname).toBe('新道号')
  })

  it('PUT /api/auth/profile - rejects empty nickname', async () => {
    const res = await fetch(`${BASE}/api/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nickname: '' }),
    })
    expect(res.status).toBe(400)
  })

  it('PUT /api/auth/profile - rejects too long nickname', async () => {
    const res = await fetch(`${BASE}/api/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nickname: 'a'.repeat(21) }),
    })
    expect(res.status).toBe(400)
  })

  it('GET /api/auth/me - returns updated nickname', async () => {
    const res = await fetch(`${BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.character.nickname).toBe('新道号')
  })
})

describe('Adventure API', () => {
  let token = ''
  let characterId = ''
  const testEmail = `adv_${Date.now()}@vitest.com`

  beforeAll(async () => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'test123456' }),
    })
    const body = await res.json()
    token = body.token
    const me = await fetch(`${BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
    const meBody = await me.json()
    characterId = meBody.character.id
  })

  it('GET /api/adventure/pending - returns null when no events', async () => {
    const res = await fetch(`${BASE}/api/adventure/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    // May or may not have a pending event due to random trigger
    expect(body).toHaveProperty('event')
  })

  it('POST /api/adventure/clear - succeeds', async () => {
    const res = await fetch(`${BASE}/api/adventure/clear`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
  })

  it('POST /api/adventure/resolve - fails with no pending event', async () => {
    await fetch(`${BASE}/api/adventure/clear`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    const res = await fetch(`${BASE}/api/adventure/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ choice: 0 }),
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.message).toContain('没有待处理')
  })

  it('full cycle: trigger pending + resolve gives reward', async () => {
    // Clear, then call pending repeatedly until an event triggers
    await fetch(`${BASE}/api/adventure/clear`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })

    let eventId = ''
    for (let i = 0; i < 50; i++) {
      const res = await fetch(`${BASE}/api/adventure/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const body = await res.json()
      if (body.event) {
        eventId = body.event.id
        // Event was triggered! If it was auto-resolved, try pending again
        const body2 = await (await fetch(`${BASE}/api/adventure/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        })).json()
        if (body2.event) break
      }
    }
    expect(eventId).toBeTruthy() // An event should have been triggered

    const resolveRes = await fetch(`${BASE}/api/adventure/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ choice: 0 }),
    })
    expect(resolveRes.status).toBe(200)
    const resolveBody = await resolveRes.json()
    expect(resolveBody.success).toBe(true)
    expect(resolveBody.message).toBeTruthy()
  })
})

describe('Sign-in API', () => {
  let token = ''
  const testEmail = `sign_${Date.now()}@vitest.com`

  beforeAll(async () => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'test123456' }),
    })
    const body = await res.json()
    token = body.token
  })

  it('POST /api/sign-in - returns reward and consecutive days', async () => {
    const res = await fetch(`${BASE}/api/sign-in`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.reward).toBeTypeOf('number')
    expect(body.consecutiveDays).toBeTypeOf('number')
    expect(body.consecutiveDays).toBe(1)
    expect(body.reward).toBe(10)
  })

  it('GET /api/sign-in/status - returns today status', async () => {
    const res = await fetch(`${BASE}/api/sign-in/status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.signedIn).toBe(true)
    expect(body.consecutiveDays).toBe(1)
  })

  it('POST /api/sign-in - rejects duplicate sign-in same day', async () => {
    const res = await fetch(`${BASE}/api/sign-in`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.message).toContain('已签到')
  })
})

describe('Sign-in consecutive rewards', () => {
  let token = ''
  let characterId = ''
  const testEmail = `sign2_${Date.now()}@vitest.com`

  beforeAll(async () => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'test123456' }),
    })
    const body = await res.json()
    token = body.token

    // Get character ID from /me
    const me = await fetch(`${BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const meBody = await me.json()
    characterId = meBody.character.id
  })

  it('day 2 sign-in gives increased reward', async () => {
    // Simulate yesterday's sign-in by inserting directly into DB
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const dbBody = { characterId, signDate: yesterday, consecutiveDays: 1, reward: '10' }

    const injectRes = await fetch(`${BASE}/api/sign-in/inject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(dbBody),
    })
    expect(injectRes.status).toBe(200)

    // Now sign in today — should be day 2
    const res = await fetch(`${BASE}/api/sign-in`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.consecutiveDays).toBe(2)
    expect(body.reward).toBe(15)
  })
})
