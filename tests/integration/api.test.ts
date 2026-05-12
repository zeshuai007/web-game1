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
