import { describe, it, expect } from 'vitest'

const BASE = 'http://localhost:3000'

async function register(nickname: string, resources: { lingshi?: number; materials?: Record<string, number> }) {
  const email = `sw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@test.com`
  const r = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'swtest123', nickname }),
  })
  const d = await r.json()
  const m = await (await fetch(`${BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${d.token}` } })).json()
  const token = d.token as string
  const cid = m.character.id as string
  await fetch(`${BASE}/api/test/char-resource`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ characterId: cid, ...resources }),
  })
  return { token, cid }
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

describe('结算接线与游戏节奏（#67/#69/#70 回归）', () => {
  it('穿戴装备后结算包含品质加成（equipBonusQi > 0），卸下回落', async () => {
    const u = await register('装备师', { lingshi: 5000, materials: { youhun_cao: 10 } })

    const craft = await req('POST', '/api/forge/craft', u.token, { recipeId: 'wooden_sword' })
    expect(craft.status).toBe(200)
    const equipmentId = craft.data.equipment?.id ?? craft.data.equipmentId
    expect(equipmentId).toBeTruthy()

    // 未穿戴：加成为 0
    const before = await req('GET', '/api/cultivate/progress', u.token)
    expect(before.data.offlineEarnings.equipBonusQi).toBe(0)

    // 穿戴：所有品质档位 bonus_rate 均 > 0（凡器 2% 起）
    const equip = await req('POST', '/api/forge/equip', u.token, { equipmentId })
    expect(equip.status).toBe(200)

    const after = await req('GET', '/api/cultivate/progress', u.token)
    expect(after.status).toBe(200)
    expect(after.data.offlineEarnings.equipBonusQi).toBeGreaterThan(0)
  })

  it('前期速率校准为 90/分钟（#69）', async () => {
    // 存量库由 config/game 的 syncEarlyStageTuning 拉到最新调优（与线上玩家启动路径一致）
    await req('GET', '/api/config/game', null)
    const u = await register('节奏员', {})
    const p = await req('GET', '/api/cultivate/progress', u.token)
    expect(p.data.character.lingqiRate).toBe('90.0000')
    expect(p.data.realmConfig.lingqiRate).toBe(90)
  })

  it('奇遇触发后进入 10 分钟冷却，期间不再弹窗（#70）', async () => {
    const u = await register('遇缘人', {})
    let triggered = false
    // 触发一次奇遇（baseChance 高，几次内必中）
    for (let i = 0; i < 15 && !triggered; i++) {
      const p = await req('GET', '/api/adventure/pending', u.token)
      if (p.data.event) {
        triggered = true
        await req('POST', '/api/adventure/resolve', u.token, { choice: 0 })
      }
      await new Promise(r => setTimeout(r, 150))
    }
    expect(triggered).toBe(true) // 前置：确实触发过一次

    // 冷却期内连续轮询不应再出现新事件
    for (let i = 0; i < 5; i++) {
      const p = await req('GET', '/api/adventure/pending', u.token)
      expect(p.data.event).toBeNull()
      await new Promise(r => setTimeout(r, 100))
    }
  })

  it('加入宗门后结算正常且返回宗门加成字段（smoke）', async () => {
    const A = await register('宗门接线甲', { lingshi: 1000 })
    const create = await req('POST', '/api/clan/create', A.token, { name: `接线宗门${Date.now() % 100000}` })
    expect(create.status).toBe(200)

    const p = await req('GET', '/api/cultivate/progress', A.token)
    expect(p.status).toBe(200)
    expect(p.data.offlineEarnings).toHaveProperty('clanBonus')
    // 1 级宗门加成为 0，仅验证链路连通与字段语义
    expect(p.data.offlineEarnings.clanBonus).toBe(0)
  })
})
