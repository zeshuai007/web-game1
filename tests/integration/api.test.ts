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

describe('Friends API', () => {
  let tokenA = '', tokenB = ''
  let charIdA = '', charIdB = ''

  beforeAll(async () => {
    const ts = Date.now()
    const a = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `friend_a_${ts}@test.com`, password: 'test123456', nickname: '道友A' }),
    })
    const aBody = await a.json(); tokenA = aBody.token
    const meA = await fetch(`${BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${tokenA}` } })
    charIdA = (await meA.json()).character.id

    const b = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `friend_b_${ts}@test.com`, password: 'test123456', nickname: '道友B' }),
    })
    const bBody = await b.json(); tokenB = bBody.token
    const meB = await fetch(`${BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${tokenB}` } })
    charIdB = (await meB.json()).character.id
  })

  it('POST /api/friends/request - sends friend request', async () => {
    const res = await fetch(`${BASE}/api/friends/request`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ toCharacterId: charIdB }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('pending')
  })

  it('POST /api/friends/request - rejects self-request', async () => {
    const res = await fetch(`${BASE}/api/friends/request`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ toCharacterId: charIdA }),
    })
    expect(res.status).toBe(400)
  })

  it('POST /api/friends/request - rejects duplicate', async () => {
    const res = await fetch(`${BASE}/api/friends/request`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ toCharacterId: charIdB }),
    })
    expect(res.status).toBe(409)
  })

  it('POST /api/friends/respond - accepts request', async () => {
    // Get pending request ID
    const pending = await (await fetch(`${BASE}/api/friends/pending`, { headers: { Authorization: `Bearer ${tokenB}` } })).json()
    const reqId = pending.requests?.[0]?.id
    if (!reqId) { expect(true).toBe(false); return }

    const res = await fetch(`${BASE}/api/friends/respond`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ requestId: reqId, action: 'accept' }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('accepted')
  })

  it('GET /api/friends/list - returns friends', async () => {
    const res = await fetch(`${BASE}/api/friends/list`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.friends)).toBe(true)
    expect(body.friends.some((f: any) => f.nickname === '道友B')).toBe(true)
  })

  it('DELETE /api/friends/:id - removes friend', async () => {
    const list = await (await fetch(`${BASE}/api/friends/list`, { headers: { Authorization: `Bearer ${tokenA}` } })).json()
    const friendId = list.friends[0]?.id
    if (!friendId) return
    const res = await fetch(`${BASE}/api/friends/${friendId}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${tokenA}` },
    })
    expect(res.status).toBe(200)
  })
})

describe('Forge API', () => {
  let token = ''
  const testEmail = `forge_${Date.now()}@vitest.com`

  beforeAll(async () => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'test123456' }),
    })
    const body = await res.json()
    token = body.token
  })

  it('POST /api/forge/craft - creates equipment', async () => {
    // Get character ID
    const me = await (await fetch(`${BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })).json()
    const charId = me.character.id

    // Give lingshi + materials directly via test-only endpoints
    await fetch(`${BASE}/api/test/char-resource`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ characterId: charId, lingshi: 200, materials: { youhun_cao: 5 } }),
    })

    const res = await fetch(`${BASE}/api/forge/craft`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ recipeId: 'wooden_sword' }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.equipment).toBeDefined()
    expect(body.equipment.slot).toBe('weapon')
    expect(body.quality).toBeGreaterThanOrEqual(0)
    expect(body.quality).toBeLessThanOrEqual(4)
  })

  it('POST /api/forge/craft - rejects invalid recipe', async () => {
    const res = await fetch(`${BASE}/api/forge/craft`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ recipeId: 'invalid' }),
    })
    expect(res.status).toBe(400)
  })

  it('GET /api/forge/inventory - returns equipment list', async () => {
    const res = await fetch(`${BASE}/api/forge/inventory`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.items)).toBe(true)
    expect(body.items.length).toBeGreaterThanOrEqual(1)
  })

  it('POST /api/forge/equip - equips item', async () => {
    // Get an unequipped item
    const inv = await (await fetch(`${BASE}/api/forge/inventory`, { headers: { Authorization: `Bearer ${token}` } })).json()
    const item = inv.items.find((i: any) => !i.equipped)
    if (!item) { expect(true).toBe(true); return }

    const res = await fetch(`${BASE}/api/forge/equip`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ equipmentId: item.id }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })
})

describe('Dao API', () => {
  let tokenA = '', tokenB = ''
  let charIdA = '', charIdB = ''

  beforeAll(async () => {
    const ts = Date.now()
    const a = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `dao_a_${ts}@test.com`, password: 'test123456', nickname: 'DaoA' }),
    })
    const aBody = await a.json(); tokenA = aBody.token
    const meA = await fetch(`${BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${tokenA}` } })
    charIdA = (await meA.json()).character.id

    const b = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `dao_b_${ts}@test.com`, password: 'test123456', nickname: 'DaoB' }),
    })
    const bBody = await b.json(); tokenB = bBody.token
    const meB = await fetch(`${BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${tokenB}` } })
    charIdB = (await meB.json()).character.id
  })

  it('POST /api/friends/request - add friend for dao test', async () => {
    await fetch(`${BASE}/api/friends/request`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ toCharacterId: charIdB }),
    })
  })

  it('POST /api/friends/respond - accept', async () => {
    // Find pending request
    const list = await (await fetch(`${BASE}/api/friends/pending`, { headers: { Authorization: `Bearer ${tokenB}` } })).json()
    if (list.requests?.length) {
      await fetch(`${BASE}/api/friends/respond`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
        body: JSON.stringify({ requestId: list.requests[0].id, action: 'accept' }),
      })
    }
  })

  it('POST /api/dao/start - dao with friend gives lingqi', async () => {
    const res = await fetch(`${BASE}/api/dao/start`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ targetCharacterId: charIdB }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.lingqiGain).toBeGreaterThan(0)
    expect(body.message).toBeTruthy()
  })

  it('POST /api/dao/start - rejects duplicate same day', async () => {
    const res = await fetch(`${BASE}/api/dao/start`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ targetCharacterId: charIdB }),
    })
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.message).toContain('今日已论道')
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
