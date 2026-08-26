import { describe, it, expect } from 'vitest'

const BASE = 'http://localhost:3000'

async function register(nickname: string, lingshi: number, materials: Record<string, number>) {
  const email = `ec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@test.com`
  const r = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'ectest123', nickname }),
  })
  const d = await r.json()
  const m = await (await fetch(`${BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${d.token}` } })).json()
  const token = d.token as string
  const cid = m.character.id as string
  // 铺垫资源
  await fetch(`${BASE}/api/test/char-resource`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ characterId: cid, lingshi, materials }),
  })
  return { token, cid }
}

async function state(token: string) {
  const m = await (await fetch(`${BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })).json()
  const inv = await (await fetch(`${BASE}/api/inventory`, { headers: { Authorization: `Bearer ${token}` } })).json()
  return {
    lingshi: parseFloat(m.character.lingshi),
    items: Object.fromEntries((inv.items ?? []).map((i: any) => [i.itemId, i.quantity])),
  }
}

async function refine(token: string, pillType: string) {
  return fetch(`${BASE}/api/alchemy/refine`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ pillType }),
  })
}
async function buy(token: string, itemId: string, quantity = 1) {
  return fetch(`${BASE}/api/shop/buy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ itemId, quantity }),
  })
}

describe('经济链路事务化（#62 回归）', () => {
  it('炼丹：第二种材料不足时，灵石与第一种材料均不被扣除', async () => {
    // 培元丹 = 幽魂草×2 + 凝血花×1 + 50灵石；只给幽魂草
    const u = await register('事务甲', 10000, { youhun_cao: 5 })
    const before = await state(u.token)

    const res = await refine(u.token, 'peiyuan_dan')
    expect(res.status).toBe(400)

    const after = await state(u.token)
    expect(after.lingshi).toBe(before.lingshi) // 不扣款
    expect(after.items['youhun_cao']).toBe(before.items['youhun_cao']) // 已有材料也不扣
  })

  it('并发两次炼丹同一配方，最终账目严格一致', async () => {
    // 培元丹消耗 幽魂草×2 + 凝血花×1 + 50灵石；给恰好两份
    const u = await register('事务乙', 100, { youhun_cao: 4, ningxue_hua: 2 })
    const before = await state(u.token)

    const results = await Promise.all([refine(u.token, 'peiyuan_dan'), refine(u.token, 'peiyuan_dan')])
    const okCount = results.filter(r => r.status === 200).length

    const after = await state(u.token)
    expect(after.lingshi).toBe(before.lingshi - 50 * okCount)
    expect(after.items['youhun_cao']).toBe(before.items['youhun_cao']! - 2 * okCount)
    expect(after.items['ningxue_hua']).toBe(before.items['ningxue_hua']! - 1 * okCount)
    expect(after.items['peiyuan_dan']).toBe(okCount)

    // 行锁串行化下材料恰好够 → 两单都成功；若实现错误则会出现负数或对不上账
    expect(okCount).toBe(2)
  })

  it('购买：数量上限与余额校验，成功后账目一致', async () => {
    const u = await register('事务丙', 500, {})
    const before = await state(u.token)

    const badQty = await buy(u.token, 'youhun_cao', 1000)
    expect(badQty.status).toBe(400)

    const res = await buy(u.token, 'youhun_cao', 10) // 10 × 10 = 100 灵石
    expect(res.status).toBe(200)

    const after = await state(u.token)
    expect(after.lingshi).toBe(before.lingshi - 100)
    expect(after.items['youhun_cao']).toBe((before.items['youhun_cao'] ?? 0) + 10)

    const poor = await buy(u.token, 'qicai_xuelian', 999999 % 1000 + 400)
    expect(poor.status).toBe(400) // 余额不足
  })
})
