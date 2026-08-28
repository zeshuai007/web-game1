import { describe, it, expect } from 'vitest'

const BASE = 'http://localhost:3000'

async function register(nickname: string) {
  const email = `pb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@test.com`
  const r = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'pbtest123', nickname }),
  })
  const d = await r.json()
  const m = await (await fetch(`${BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${d.token}` } })).json()
  return { token: d.token as string, cid: m.character.id as string }
}

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

describe('修炼丹 buff 系统（#61 回归）与小境界自动晋升（#63）', () => {
  it('服用修炼丹获得 30 分钟灵气加成；破境丹不可服用', async () => {
    const u = await register('丹药测试')
    await req('POST', '/api/test/char-resource', u.token, { characterId: u.cid, lingshi: 100000, materials: { youhun_cao: 10, ningxue_hua: 5 } })

    // 炼一颗培元丹并服用
    expect((await req('POST', '/api/alchemy/refine', u.token, { pillType: 'peiyuan_dan' })).status).toBe(200)
    const consume = await req('POST', '/api/alchemy/consume', u.token, { itemId: 'peiyuan_dan' })
    expect(consume.status).toBe(200)
    expect(consume.data.pillBuffRate).toBe(0.2)
    expect(new Date(consume.data.pillBuffUntil).getTime()).toBeGreaterThan(Date.now())

    const me = (await (await req('GET', '/api/auth/me', u.token)).data)
    expect(me.character.pillBuffItemId).toBe('peiyuan_dan')
    expect(parseFloat(me.character.pillBuffRate)).toBe(0.2)

    // 背包里丹药 -1
    const inv = (await (await req('GET', '/api/inventory', u.token)).data.items ?? [])
    expect(inv.find((i: any) => i.itemId === 'peiyuan_dan')?.quantity ?? 0).toBe(0)

    // 破境丹不是修炼丹，拒绝服用
    await req('POST', '/api/test/char-resource', u.token, { materials: { zhuji_dan: 1 } })
    const wrongType = await req('POST', '/api/alchemy/consume', u.token, { itemId: 'zhuji_dan' })
    expect(wrongType.status).toBe(400)

    // 没有库存的丹药拒绝服用
    const noPill = await req('POST', '/api/alchemy/consume', u.token, { itemId: 'qianji_dan' })
    expect(noPill.status).toBe(400)
  })

  it('buff 期间 progress 结算按加成速率分段计费', async () => {
    const u = await register('加速测试')
    await req('POST', '/api/test/char-resource', u.token, { characterId: u.cid, lingshi: 100000, materials: { youhun_cao: 10, ningxue_hua: 5 } })
    await req('POST', '/api/alchemy/refine', u.token, { pillType: 'peiyuan_dan' })
    expect((await req('POST', '/api/alchemy/consume', u.token, { itemId: 'peiyuan_dan' })).status).toBe(200)

    const p1 = await req('GET', '/api/cultivate/progress', u.token)
    const rate = parseFloat(p1.data.character.lingqiRate) // 基础速率 15

    // 等一小段再结算：gain 应 ≈ rate × (1.2) × 分钟数（允许时间误差放大容差）
    await new Promise(r => setTimeout(r, 1200))
    const before = parseFloat(p1.data.character.lingqi)
    const t0 = Date.now()
    const p2 = await req('GET', '/api/cultivate/progress', u.token)
    const elapsedMin = (Date.now() - t0) / 60000 + 2 / 60
    const gained = parseFloat(p2.data.character.lingqi) - before

    expect(gained).toBeGreaterThan(rate * 1.05 * elapsedMin * 0.5) // 明显高于无 buff 的一半以下不可能
    expect(gained).toBeLessThanOrEqual(rate * 1.25 * elapsedMin * 1.6) // 上限 1.2 倍率 + 容差
  })

  it('小境界灵气攒满后由 progress 自动晋升（PRD US8「无需操作」）', async () => {
    const u = await register('自动晋升')
    // 凝气期第 3 层、灵气直接圆满
    await req('POST', '/api/test/char-resource', u.token, { characterId: u.cid, realmLayer: 3, lingqi: 150 })

    const p = await req('GET', '/api/cultivate/progress', u.token)
    expect(p.status).toBe(200)
    expect(p.data.autoBreakthroughs).toBeGreaterThanOrEqual(1)
    expect(p.data.character.realmLayer).toBeGreaterThanOrEqual(4)
    expect(parseFloat(p.data.character.lingqi)).toBeLessThan(150)
  })

  it('大境界瓶颈不自动晋升（保留玩家主动突破）', async () => {
    const u = await register('瓶颈测试')
    await req('POST', '/api/test/char-resource', u.token, { characterId: u.cid, realmLayer: 9, lingqi: 150 })

    const p = await req('GET', '/api/cultivate/progress', u.token)
    expect(p.status).toBe(200)
    expect(p.data.autoBreakthroughs).toBe(0)
    expect(p.data.character.realmLayer).toBe(9) // 保持瓶颈状态等待玩家突破
  })
})
