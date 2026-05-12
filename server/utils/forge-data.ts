export const qualityNames = ['凡器', '法器', '宝器', '灵器', '仙器']
export const qualityColors = ['text-ink-300', 'text-jade-400', 'text-blue-400', 'text-purple-400', 'text-gold-400']

export interface ForgeRecipe {
  id: string; name: string; slot: string
  materials: { id: string; qty: number }[]
  cost: number
}

export const forgeRecipes: ForgeRecipe[] = [
  { id: 'wooden_sword', name: '木剑', slot: 'weapon', materials: [{ id: 'youhun_cao', qty: 3 }], cost: 50 },
  { id: 'bronze_armor', name: '青铜甲', slot: 'armor', materials: [{ id: 'ningxue_hua', qty: 3 }], cost: 80 },
  { id: 'jade_pendant', name: '玉佩', slot: 'accessory', materials: [{ id: 'hansui_ye', qty: 3 }], cost: 100 },
  { id: 'spirit_circlet', name: '灵环', slot: 'artifact', materials: [{ id: 'longxian_guo', qty: 2 }, { id: 'wannian_lingzhi', qty: 1 }], cost: 500 },
]

/** Roll equipment quality. Returns index 0-4 */
export function rollQuality(): number {
  const r = Math.random()
  if (r < 0.50) return 0
  if (r < 0.80) return 1
  if (r < 0.95) return 2
  if (r < 0.99) return 3
  return 4
}

export function calcQualityBonuses(quality: number) {
  const bonus = [0.02, 0.05, 0.10, 0.20, 0.40][quality] || 0
  return { bonusLingqiRate: bonus, bonusLingshiRate: bonus }
}
