import { describe, expect, it } from 'vitest'

import { resolveMajorBreakthrough } from '../../server/utils/cultivation-balance'

describe('resolveMajorBreakthrough', () => {
  it('前两段大境界突破失败时保留 50% 进度并累计 1 次连败', () => {
    const result = resolveMajorBreakthrough({
      baseChance: 0.6,
      failureCount: 0,
      lingqiCap: 150,
      progressRetainRate: 0.5,
      pityChanceStep: 0.05,
      pityChanceMax: 0.2,
      roll: 0.95,
    })

    expect(result.success).toBe(false)
    expect(result.pityBonus).toBe(0)
    expect(result.effectiveChance).toBe(0.6)
    expect(result.nextFailureCount).toBe(1)
    expect(result.nextLingqi).toBe(75)
  })

  it('连败保底按 +5% 线性增长并在 +20% 封顶', () => {
    const result = resolveMajorBreakthrough({
      baseChance: 0.5,
      failureCount: 5,
      lingqiCap: 150,
      progressRetainRate: 0.5,
      pityChanceStep: 0.05,
      pityChanceMax: 0.2,
      roll: 0.69,
    })

    expect(result.pityBonus).toBe(0.2)
    expect(result.effectiveChance).toBe(0.7)
    expect(result.success).toBe(true)
    expect(result.nextFailureCount).toBe(0)
    expect(result.nextLingqi).toBe(0)
  })
})
