export interface MajorBreakthroughResolutionInput {
  baseChance: number
  failureCount: number
  lingqiCap: number
  progressRetainRate: number
  pityChanceStep: number
  pityChanceMax: number
  roll: number
}

export interface MajorBreakthroughResolution {
  success: boolean
  pityBonus: number
  effectiveChance: number
  nextFailureCount: number
  nextLingqi: number
}

export function resolveMajorBreakthrough(input: MajorBreakthroughResolutionInput): MajorBreakthroughResolution {
  const pityBonus = Math.min(input.failureCount * input.pityChanceStep, input.pityChanceMax)
  const effectiveChance = Math.min(input.baseChance + pityBonus, 0.9)
  const success = input.roll < effectiveChance

  if (success) {
    return {
      success: true,
      pityBonus,
      effectiveChance,
      nextFailureCount: 0,
      nextLingqi: 0,
    }
  }

  return {
    success: false,
    pityBonus,
    effectiveChance,
    nextFailureCount: input.failureCount + 1,
    nextLingqi: Math.floor(input.lingqiCap * input.progressRetainRate),
  }
}
