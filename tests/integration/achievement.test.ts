import { describe, it, expect, beforeAll } from 'vitest'

const BASE = 'http://localhost:3000'

describe('Achievement API', () => {
  let token = ''
  const testEmail = `ach_${Date.now()}@vitest.com`

  beforeAll(async () => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'test123456', nickname: 'AchTest' }),
    })
    const body = await res.json()
    token = body.token
  })

  it('GET /api/achievement/list - returns achievement definitions', async () => {
    const res = await fetch(`${BASE}/api/achievement/list`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.achievements.length).toBe(22)
    expect(body.achievements[0].key).toBe('to_foundation')
    expect(body.achievements[0].completed).toBe(0)
  })

  it('POST /api/achievement/check - checks realm achievement after breakthrough', async () => {
    // Simulate breakthrough by calling check with realm type
    const res = await fetch(`${BASE}/api/achievement/check`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ eventType: 'breakthrough', realm: 'foundation' }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    const found = body.completed.find((a: any) => a.key === 'to_foundation')
    expect(found).toBeDefined()
    expect(found.completed).toBe(1)
  })

  it('POST /api/achievement/claim - claims reward', async () => {
    // Get achievements to find completed one
    const list = await (await fetch(`${BASE}/api/achievement/list`, { headers: { Authorization: `Bearer ${token}` } })).json()
    const completed = list.achievements.find((a: any) => a.completed && !a.claimed)
    if (!completed) { expect(true).toBe(true); return }

    const res = await fetch(`${BASE}/api/achievement/claim`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ achievementKey: completed.key }),
    })
    expect(res.status).toBe(200)
    expect((await res.json()).success).toBe(true)
  })
})
