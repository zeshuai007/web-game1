import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../server/db/schema', () => {
  const realmEnum = [
    'condensing_qi',
    'foundation',
    'core_formation',
    'nascent_soul',
    'deity_transformation',
    'nascent_transformation',
    'seeking_heaven',
  ] as const

  return {
    characters: { $inferSelect: {} },
    realmEnum,
    realmLabels: {
      condensing_qi: '凝气期',
      foundation: '筑基期',
      core_formation: '结丹期',
      nascent_soul: '元婴期',
      deity_transformation: '化神期',
      nascent_transformation: '婴变期',
      seeking_heaven: '问鼎期',
    },
  }
})

import {
  getMaxLayer,
  getNextRealm,
  isMaxLayer,
  calcOfflineEarnings,
  breakthroughRoll,
  getPillCultivationBonus,
  getPillBreakthroughBonus,
  realmConfigs,
  breakthroughBaseChance,
  rollQuality,
  calcQualityBonuses,
  qualityNames,
  forgeRecipes,
} from '../../server/utils/game-engine'

function mockCharacter(overrides = {}) {
  return {
    id: 'test-id',
    userId: 'test-user-id',
    nickname: '测试散修',
    realm: 'condensing_qi',
    realmLayer: 1,
    lingqi: '0',
    lingqiCap: '1000',
    lingshi: '0',
    lingshiRate: '10',
    lingqiRate: '10',
    offlineStartedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('getMaxLayer', () => {
  it('returns 9 for condensing_qi', () => {
    expect(getMaxLayer('condensing_qi')).toBe(9)
  })

  it('returns 3 for all other realms', () => {
    for (const realm of ['foundation', 'core_formation', 'nascent_soul', 'deity_transformation', 'nascent_transformation', 'seeking_heaven'] as const) {
      expect(getMaxLayer(realm)).toBe(3)
    }
  })
})

describe('getNextRealm', () => {
  it('returns the next realm in sequence', () => {
    expect(getNextRealm('condensing_qi')).toBe('foundation')
    expect(getNextRealm('foundation')).toBe('core_formation')
    expect(getNextRealm('nascent_soul')).toBe('deity_transformation')
  })

  it('returns null for the highest realm', () => {
    expect(getNextRealm('seeking_heaven')).toBeNull()
  })
})

describe('isMaxLayer', () => {
  it('returns true when layer >= max layer', () => {
    expect(isMaxLayer('condensing_qi', 9)).toBe(true)
    expect(isMaxLayer('foundation', 3)).toBe(true)
  })

  it('returns false when layer < max layer', () => {
    expect(isMaxLayer('condensing_qi', 1)).toBe(false)
    expect(isMaxLayer('foundation', 2)).toBe(false)
  })
})

describe('calcOfflineEarnings', () => {
  it('returns zero earnings for zero elapsed time', () => {
    const char = mockCharacter()
    const result = calcOfflineEarnings(char, 0)
    expect(result.lingqiGain).toBe(0)
    expect(result.lingshiGain).toBe(0)
    expect(result.effectiveMinutes).toBe(0)
  })

  it('calculates earnings correctly for given minutes', () => {
    const char = mockCharacter({ realm: 'condensing_qi' })
    const result = calcOfflineEarnings(char, 60) // 1 hour
    expect(result.lingqiGain).toBe(realmConfigs.condensing_qi.lingqiRate * 60)
    expect(result.lingshiGain).toBe(realmConfigs.condensing_qi.lingshiRate * 60)
    expect(result.effectiveMinutes).toBe(60)
  })

  it('caps earnings at 24 hours', () => {
    const char = mockCharacter({ realm: 'condensing_qi' })
    const result = calcOfflineEarnings(char, 60 * 48) // 48 hours
    expect(result.effectiveMinutes).toBe(24 * 60) // capped at 1440
    expect(result.lingqiGain).toBe(realmConfigs.condensing_qi.lingqiRate * 24 * 60)
  })

  it('uses higher rates for higher realms', () => {
    const qiChar = mockCharacter({ realm: 'condensing_qi' })
    const coreChar = mockCharacter({ realm: 'core_formation' })
    const qiResult = calcOfflineEarnings(qiChar, 60)
    const coreResult = calcOfflineEarnings(coreChar, 60)
    expect(coreResult.lingqiGain).toBeGreaterThan(qiResult.lingqiGain)
  })
})

describe('breakthroughRoll', () => {
  it('uses base chance without pill', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.59)
    expect(breakthroughRoll('condensing_qi', false)).toBe(true)
    Math.random.mockRestore()
  })

  it('fails when random is above base chance', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.61)
    expect(breakthroughRoll('condensing_qi', false)).toBe(false)
    Math.random.mockRestore()
  })

  it('adds 20% when pill is used', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.75)
    expect(breakthroughRoll('condensing_qi', true)).toBe(true)
    Math.random.mockRestore()
  })

  it('pill adds 20% to base chance', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.34)
    expect(breakthroughRoll('nascent_transformation', true)).toBe(true) // 0.15+0.2=0.35
    Math.random.mockRestore()
  })

  it('uses default 15% chance for unknown realm', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.14)
    expect(breakthroughRoll('seeking_heaven', false)).toBe(true)
    Math.random.mockRestore()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })
})

describe('getPillCultivationBonus', () => {
  it('returns correct bonus for each pill', () => {
    expect(getPillCultivationBonus('peiyuan_dan')).toBe(0.2)
    expect(getPillCultivationBonus('qihuang_dan')).toBe(0.25)
    expect(getPillCultivationBonus('qianji_dan')).toBe(0.3)
    expect(getPillCultivationBonus('taiyi_dan')).toBe(0.35)
    expect(getPillCultivationBonus('tianyun_dan')).toBe(0.4)
    expect(getPillCultivationBonus('xuanyuan_dan')).toBe(0.45)
    expect(getPillCultivationBonus('wendao_dan')).toBe(0.5)
  })

  it('returns 0 for unknown pill', () => {
    expect(getPillCultivationBonus('unknown_pill')).toBe(0)
  })

  it('returns 0 for null input', () => {
    expect(getPillCultivationBonus(null)).toBe(0)
  })
})

describe('getPillBreakthroughBonus', () => {
  it('returns 0.2 for breakthrough pills', () => {
    expect(getPillBreakthroughBonus('zhuji_dan')).toBe(0.2)
    expect(getPillBreakthroughBonus('tianli_dan')).toBe(0.2)
    expect(getPillBreakthroughBonus('qingyun_dan')).toBe(0.2)
    expect(getPillBreakthroughBonus('huashen_dan')).toBe(0.2)
    expect(getPillBreakthroughBonus('yingbian_dan')).toBe(0.2)
    expect(getPillBreakthroughBonus('wending_dan')).toBe(0.2)
  })

  it('returns 0 for cultivation pill', () => {
    expect(getPillBreakthroughBonus('peiyuan_dan')).toBe(0)
  })
})

describe('realm config consistency', () => {
  it('has all realms in config', () => {
    const realms = ['condensing_qi', 'foundation', 'core_formation', 'nascent_soul', 'deity_transformation', 'nascent_transformation', 'seeking_heaven']
    for (const realm of realms) {
      expect(realmConfigs[realm]).toBeDefined()
      expect(realmConfigs[realm].label).toBeTruthy()
    }
  })

  it('has increasing lingqiCap', () => {
    const caps = Object.values(realmConfigs).map(c => c.lingqiCap)
    for (let i = 1; i < caps.length; i++) {
      expect(caps[i]).toBeGreaterThan(caps[i - 1])
    }
  })

  it('has increasing rates', () => {
    const rates = Object.values(realmConfigs).map(c => c.lingqiRate)
    for (let i = 1; i < rates.length; i++) {
      expect(rates[i]).toBeGreaterThan(rates[i - 1])
    }
  })

  it('has forge recipes with valid slots', () => {
    for (const r of forgeRecipes) {
      expect(r.slot).toMatch(/weapon|armor|accessory|artifact/)
      expect(r.cost).toBeGreaterThan(0)
      expect(r.materials.length).toBeGreaterThan(0)
    }
  })
})

describe('forge system', () => {
  it('rollQuality returns 0-4', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.49)
    expect(rollQuality()).toBe(0)
    Math.random.mockRestore()
  })

  it('rollQuality respects probability thresholds', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.79)
    expect(rollQuality()).toBe(1)
    Math.random.mockRestore()
  })

  it('rollQuality can return highest quality', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999)
    expect(rollQuality()).toBe(4)
    Math.random.mockRestore()
  })

  it('calcQualityBonuses returns increasing rates', () => {
    const bonuses = [0, 1, 2, 3, 4].map(calcQualityBonuses)
    for (let i = 1; i < bonuses.length; i++) {
      expect(bonuses[i].bonusLingqiRate).toBeGreaterThan(bonuses[i - 1].bonusLingqiRate)
      expect(bonuses[i].bonusLingshiRate).toBeGreaterThan(bonuses[i - 1].bonusLingshiRate)
    }
  })

  it('calcQualityBonuses returns correct values', () => {
    expect(calcQualityBonuses(0)).toEqual({ bonusLingqiRate: 0.02, bonusLingshiRate: 0.02 })
    expect(calcQualityBonuses(2)).toEqual({ bonusLingqiRate: 0.10, bonusLingshiRate: 0.10 })
    expect(calcQualityBonuses(4)).toEqual({ bonusLingqiRate: 0.40, bonusLingshiRate: 0.40 })
  })

  afterEach(() => { vi.restoreAllMocks() })
})

describe('realm config consistency', () => {
  it('has breakthrough chances for all realm boundaries', () => {
    expect(breakthroughBaseChance['condensing_qi→foundation']).toBe(0.6)
    expect(breakthroughBaseChance['foundation→core_formation']).toBe(0.5)
    expect(breakthroughBaseChance['core_formation→nascent_soul']).toBe(0.3)
    expect(breakthroughBaseChance['nascent_soul→deity_transformation']).toBe(0.25)
    expect(breakthroughBaseChance['deity_transformation→nascent_transformation']).toBe(0.2)
    expect(breakthroughBaseChance['nascent_transformation→seeking_heaven']).toBe(0.15)
  })
})
