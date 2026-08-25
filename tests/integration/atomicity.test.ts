import { describe, it, expect } from 'vitest'

const BASE = 'http://localhost:3000'

async function register(): Promise<{ token: string; userId: string }> {
  const email = `atom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@test.com`
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'atomtest123', nickname: '原子测试' }),
  })
  expect(res.status).toBe(200)
  return res.json()
}

describe('数据一致性（事务与并发）', () => {
  it('并发 progress 请求不会重复结算离线收益', async () => {
    const { token } = await register()
    const H = { Authorization: `Bearer ${token}` }

    // 首次请求建立基线：offline_started_at 归位到当前时刻
    await (await fetch(`${BASE}/api/cultivate/progress`, { headers: H })).json()
    const me1 = (await (await fetch(`${BASE}/api/auth/me`, { headers: H })).json())
    const rate = parseFloat(me1.character.lingshiRate)
    const startLingshi = parseFloat(me1.character.lingshi)

    // 等待一段可观测窗口后发起真正并发的两个请求：
    // - 正确实现：两请求由行锁串行，第二个只结算极短的排队间隙，总量 ≈ 单份收益
    // - 回归场景（无锁）：两请求读到同一 offline_started_at，各结算全额 → 总量 ≈ 两份
    await new Promise(r => setTimeout(r, 1200))
    const t0 = Date.now()
    const results: any[] = await Promise.all(
      [0, 1].map(() => fetch(`${BASE}/api/cultivate/progress`, { headers: H }).then(r => r.json())),
    )
    const t1 = Date.now()

    const finalLingshi = parseFloat(results[results.length - 1].character.lingshi)
    // 两个响应应看到同一份最终值（串行化后的同一状态）
    const lingshiList = results.map(r => parseFloat(r.character.lingshi))
    expect(Math.abs(lingshiList[0] - lingshiList[1])).toBeLessThan(rate / 60)

    const windowMinutes = (t1 - t0) / 60000 + 2 / 60 // +2s 覆盖 t0 与首个请求落点间的间隔
    const gained = finalLingshi - startLingshi
    // 上限放宽到理论值的 1.75 倍：正确实现约 1.0–1.3 倍，双重结算 bug 场景约 2 倍
    expect(gained).toBeLessThanOrEqual(rate * windowMinutes * 1.75)
  })

  it('大境界突破失败/成功时丹药扣除与结果严格一致', async () => {
    // 其他测试文件可能临时改写过前期境界配置，先触发 config 接口把它同步回最新调优
    await fetch(`${BASE}/api/config/game`)

    const { token } = await register()
    const H = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

    const me = (await (await fetch(`${BASE}/api/auth/me`, { headers: H })).json())
    const characterId = me.character.id

    // 铺垫：凝气期第 9 层（大境界瓶颈）、灵气圆满、背包 2 颗筑基丹
    const setup = await fetch(`${BASE}/api/test/char-resource`, {
      method: 'POST',
      headers: H,
      body: JSON.stringify({ characterId, realmLayer: 9, lingqi: me.character.lingqiCap, materials: { zhuji_dan: 2 } }),
    })
    expect(setup.status).toBe(200)

    async function refillQi() {
      await fetch(`${BASE}/api/test/char-resource`, {
        method: 'POST',
        headers: H,
        body: JSON.stringify({ characterId, lingqi: me.character.lingqiCap }),
      })
    }

    async function attemptBreakthrough(roll: string) {
      const res = await fetch(`${BASE}/api/cultivate/breakthrough`, {
        method: 'POST',
        headers: { ...H, 'x-test-breakthrough-roll': roll },
        body: JSON.stringify({ usePill: true }),
      })
      const text = await res.text()
      expect(res.status, `${roll} → ${text}`).toBe(200)
      return JSON.parse(text)
    }
    async function pillCount() {
      const inv = await (await fetch(`${BASE}/api/inventory`, { headers: H })).json()
      return inv.items.find((i: any) => i.itemId === 'zhuji_dan')?.quantity ?? 0
    }

    // 必败突破：消耗 1 颗丹、失败计数 +1
    const fail = await attemptBreakthrough('0.99')
    expect(fail.success).toBe(false)
    expect(fail.hadPill).toBe(true)
    expect(fail.nextFailureCount).toBe(1)
    expect(await pillCount()).toBe(1)

    // 重新积攒灵气至圆满后再发起必胜突破：再消耗 1 颗丹、晋升筑基期、失败计数清零
    await refillQi()
    const win = await attemptBreakthrough('0')
    expect(win.success).toBe(true)
    expect(win.character.realm).toBe('foundation')
    expect(win.character.realmLayer).toBe(1)
    expect(win.character.breakthroughFailureCount).toBe(0)
    expect(await pillCount()).toBe(0)
  })
})
