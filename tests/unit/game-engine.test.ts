import { describe, it, expect } from 'vitest'
import { getMaxLayer, getNextRealm, isMaxLayer } from '../../server/utils/realm-config'

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
