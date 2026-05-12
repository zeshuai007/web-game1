import { describe, it, expect, beforeAll } from 'vitest'

const BASE = 'http://localhost:3000'

describe('Clan API', () => {
  const ts = Date.now()
  let tokenA = '', tokenB = ''
  let charIdA = '', charIdB = ''

  beforeAll(async () => {
    // Register temp user for cleanup, then clean clan data
    const tmp = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `tmp_${ts}@test.com`, password: 'test123456' }),
    })
    const tmpToken = (await tmp.json()).token
    await fetch(`${BASE}/api/test/clean-clans`, { method: 'POST', headers: { Authorization: `Bearer ${tmpToken}` } })

    const a = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `clan_a_${ts}@test.com`, password: 'test123456', nickname: 'ClanA' }),
    })
    const aBody = await a.json(); tokenA = aBody.token
    const meA = await fetch(`${BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${tokenA}` } })
    charIdA = (await meA.json()).character.id

    const b = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `clan_b_${ts}@test.com`, password: 'test123456', nickname: 'ClanB' }),
    })
    const bBody = await b.json(); tokenB = bBody.token
    const meB = await fetch(`${BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${tokenB}` } })
    charIdB = (await meB.json()).character.id

    // Give lingshi for clan creation
    await fetch(`${BASE}/api/test/char-resource`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ characterId: charIdA, lingshi: 1000 }),
    })
  })

  const clanName = `青云_${ts}`

  it('POST /api/clan/create - creates clan', async () => {
    const res = await fetch(`${BASE}/api/clan/create`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ name: clanName, description: '测试宗门' }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.clan.name).toBe(clanName)
    expect(body.clan.leaderCharacterId).toBe(charIdA)
  })

  it('GET /api/clan/my - returns my clan', async () => {
    const res = await fetch(`${BASE}/api/clan/my`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.clan.name).toBe(clanName)
    expect(body.role).toBe('leader')
    expect(body.members.length).toBe(1)
  })

  it('GET /api/clan/my - no clan returns 404', async () => {
    const res = await fetch(`${BASE}/api/clan/my`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    })
    expect(res.status).toBe(404)
  })

  it('POST /api/clan/search - finds clan by name', async () => {
    const res = await fetch(`${BASE}/api/clan/search`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ query: clanName }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.clans.length).toBeGreaterThanOrEqual(1)
    expect(body.clans[0].name).toBe(clanName)
  })

  it('POST /api/clan/join - joins clan', async () => {
    const search = await (await fetch(`${BASE}/api/clan/search`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ query: clanName }),
    })).json()

    const res = await fetch(`${BASE}/api/clan/join`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ clanId: search.clans[0].id }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.role).toBe('member')
  })

  it('POST /api/clan/leave - leaves clan', async () => {
    const res = await fetch(`${BASE}/api/clan/leave`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
    })
    expect(res.status).toBe(200)
  })

  it('POST /api/clan/join + kick back', async () => {
    // Rejoin
    const search = await (await fetch(`${BASE}/api/clan/search`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ query: clanName }),
    })).json()
    await fetch(`${BASE}/api/clan/join`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ clanId: search.clans[0].id }),
    })

    // Leader kicks member B
    const my = await (await fetch(`${BASE}/api/clan/my`, { headers: { Authorization: `Bearer ${tokenA}` } })).json()
    const memberB = my.members.find((m: any) => m.characterId === charIdB)
    const res = await fetch(`${BASE}/api/clan/kick`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ memberId: memberB.id }),
    })
    expect(res.status).toBe(200)
  })

  it('GET /api/clan/tasks - returns daily tasks', async () => {
    const res = await fetch(`${BASE}/api/clan/tasks`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.tasks.length).toBeGreaterThanOrEqual(1)
    expect(body.tasks[0].title).toBeTruthy()
  })

  it('POST /api/clan/task-progress - updates progress', async () => {
    const tasks = await (await fetch(`${BASE}/api/clan/tasks`, { headers: { Authorization: `Bearer ${tokenA}` } })).json()
    const taskId = tasks.tasks[0].id

    const res = await fetch(`${BASE}/api/clan/task-progress`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ taskId, amount: 3 }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.progress).toBe(3)
  })

  it('POST /api/clan/task-claim - claims reward', async () => {
    const tasks = await (await fetch(`${BASE}/api/clan/tasks`, { headers: { Authorization: `Bearer ${tokenA}` } })).json()
    // Find a completed task
    const completed = tasks.tasks.find((t: any) => t.progress >= t.targetCount)
    if (!completed) return

    const res = await fetch(`${BASE}/api/clan/task-claim`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ taskId: completed.id }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.rewardContribution).toBeGreaterThan(0)
  })
})
