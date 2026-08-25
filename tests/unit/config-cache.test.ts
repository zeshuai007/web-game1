import { describe, it, expect } from 'vitest'
import { getRealmFromDB, invalidateConfigCache } from '../../server/utils/config'

const realmRow = {
  key: 'condensing_qi',
  label: '凝气期',
  lingqiCap: '150.00',
  lingshiRate: '15.00',
  lingqiRate: '15.00',
  breakthroughChance: '0.60',
  maxLayer: 9,
  progressRetainRate: '0.50',
  pityChanceStep: '0.05',
  pityChanceMax: '0.20',
  sortOrder: 0,
}

/** 模拟 drizzle 查询链：记录实际触库次数 */
function mockDb(rows: any[], counter = { calls: 0 }) {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => {
            counter.calls++
            return rows
          },
        }),
      }),
    }),
  } as any
}

describe('配置表进程内缓存', () => {
  it('TTL 内重复读取同一境界不再触库', async () => {
    invalidateConfigCache()
    const counter = { calls: 0 }
    const db = mockDb([realmRow], counter)

    const a = await getRealmFromDB(db as any, 'condensing_qi')
    const b = await getRealmFromDB(db as any, 'condensing_qi')

    expect(counter.calls).toBe(1) // 第二次命中缓存
    expect(a).toEqual(b)
    expect(a?.lingqiCap).toBe(150)
    expect(a?.pityChanceMax).toBe(0.2)
  })

  it('不同境界各自缓存，invalidate 后重新触库', async () => {
    invalidateConfigCache()
    const counter = { calls: 0 }
    const foundationRow = { ...realmRow, key: 'foundation' }
    const db = mockDb([realmRow], counter)
    const db2 = mockDb([foundationRow], counter)

    await getRealmFromDB(db as any, 'condensing_qi')
    await getRealmFromDB(db2 as any, 'foundation')
    expect(counter.calls).toBe(2)

    await getRealmFromDB(db as any, 'condensing_qi')
    expect(counter.calls).toBe(2) // 命中

    invalidateConfigCache()
    await getRealmFromDB(db as any, 'condensing_qi')
    expect(counter.calls).toBe(3) // 失效后重新触库
  })

  it('空结果不缓存（全新库首次读取时配置可能尚未 seed）', async () => {
    invalidateConfigCache()
    const counter = { calls: 0 }
    const db = mockDb([], counter)

    const miss = await getRealmFromDB(db as any, 'seeking_heaven')
    const missAgain = await getRealmFromDB(db as any, 'seeking_heaven')

    expect(miss).toBeNull()
    expect(missAgain).toBeNull()
    expect(counter.calls).toBe(2) // 每次都真实触库
  })
})
