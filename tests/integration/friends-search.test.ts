import { describe, it, expect } from 'vitest'

const BASE = 'http://localhost:3000'

async function register(nickname: string) {
  const email = `fs_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@test.com`
  const r = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'fstest123', nickname }),
  })
  expect(r.status).toBe(200)
  const d = await r.json()
  const m = await (await fetch(`${BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${d.token}` } })).json()
  return { token: d.token as string, id: m.character.id as string, nickname }
}

describe('好友搜索（#60 回归）', () => {
  it('搜索命中结果返回 200 且包含对方（修复前必现 500）', async () => {
    const A = await register('搜甲' + Date.now() % 100000)
    const B = await register('搜乙' + Date.now() % 100000)

    const res = await fetch(`${BASE}/api/friends/search?q=${encodeURIComponent(B.nickname)}`, {
      headers: { Authorization: `Bearer ${A.token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.results.some((r: any) => r.id === B.id)).toBe(true)
    // 不包含自己
    expect(body.results.some((r: any) => r.id === A.id)).toBe(false)
  })

  it('已有好友关系的用户不再出现在搜索结果', async () => {
    const A = await register('友甲' + Date.now() % 100000)
    const B = await register('友乙' + Date.now() % 100000)

    // 建立好友关系
    await req('POST', '/api/friends/request', A.token, { toCharacterId: B.id })
    const pending = await (await req('GET', '/api/friends/pending', B.token)).data
    const requestId = pending.requests?.[0]?.id ?? pending.pending?.[0]?.id
    await req('POST', '/api/friends/respond', B.token, { requestId, action: 'accept' })

    const res = await fetch(`${BASE}/api/friends/search?q=${encodeURIComponent(B.nickname)}`, {
      headers: { Authorization: `Bearer ${A.token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.results.some((r: any) => r.id === B.id)).toBe(false)
  })
})

async function req(method: string, path: string, token: string, body?: any) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  let data = null
  try { data = await res.json() } catch {}
  return { status: res.status, data }
}
