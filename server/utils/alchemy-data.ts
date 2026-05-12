export const pillNames: Record<string, string> = {
  peiyuan_dan: '培元丹', qihuang_dan: '岐黄丹', qianji_dan: '千机丹',
  taiyi_dan: '太乙丹', tianyun_dan: '天韵丹', xuanyuan_dan: '玄元丹',
  wendao_dan: '问道丹', zhuji_dan: '筑基丹', tianli_dan: '天离丹',
  qingyun_dan: '青云丹', huashen_dan: '化神丹', yingbian_dan: '婴变丹',
  wending_dan: '问鼎丹',
}

export const materialNames: Record<string, string> = {
  youhun_cao: '幽魂草', ningxue_hua: '凝血花', hansui_ye: '寒髓叶',
  longxian_guo: '龙涎果', wannian_lingzhi: '万年灵芝', qicai_xuelian: '七彩雪莲',
}

export interface AlchemyRecipe {
  id: string; name: string; type: 'cultivation' | 'breakthrough'
  realm: string; materials: { id: string; name: string; quantity: number }[]
  cost: number; effect: string
}

export const alchemyRecipes: AlchemyRecipe[] = [
  { id: 'peiyuan_dan', name: '培元丹', type: 'cultivation', realm: '凝气期', materials: [{ id: 'youhun_cao', name: '幽魂草', quantity: 2 }, { id: 'ningxue_hua', name: '凝血花', quantity: 1 }], cost: 50, effect: '修炼速度 +20%' },
  { id: 'qihuang_dan', name: '岐黄丹', type: 'cultivation', realm: '筑基期', materials: [{ id: 'youhun_cao', name: '幽魂草', quantity: 3 }, { id: 'hansui_ye', name: '寒髓叶', quantity: 2 }], cost: 200, effect: '修炼速度 +25%' },
  { id: 'qianji_dan', name: '千机丹', type: 'cultivation', realm: '结丹期', materials: [{ id: 'ningxue_hua', name: '凝血花', quantity: 3 }, { id: 'hansui_ye', name: '寒髓叶', quantity: 3 }], cost: 800, effect: '修炼速度 +30%' },
  { id: 'taiyi_dan', name: '太乙丹', type: 'cultivation', realm: '元婴期', materials: [{ id: 'longxian_guo', name: '龙涎果', quantity: 2 }, { id: 'hansui_ye', name: '寒髓叶', quantity: 4 }], cost: 3000, effect: '修炼速度 +35%' },
  { id: 'tianyun_dan', name: '天韵丹', type: 'cultivation', realm: '化神期', materials: [{ id: 'longxian_guo', name: '龙涎果', quantity: 3 }, { id: 'wannian_lingzhi', name: '万年灵芝', quantity: 2 }], cost: 10000, effect: '修炼速度 +40%' },
  { id: 'xuanyuan_dan', name: '玄元丹', type: 'cultivation', realm: '婴变期', materials: [{ id: 'wannian_lingzhi', name: '万年灵芝', quantity: 3 }, { id: 'qicai_xuelian', name: '七彩雪莲', quantity: 2 }], cost: 50000, effect: '修炼速度 +45%' },
  { id: 'wendao_dan', name: '问道丹', type: 'cultivation', realm: '问鼎期', materials: [{ id: 'qicai_xuelian', name: '七彩雪莲', quantity: 4 }, { id: 'wannian_lingzhi', name: '万年灵芝', quantity: 4 }], cost: 200000, effect: '修炼速度 +50%' },
  { id: 'zhuji_dan', name: '筑基丹', type: 'breakthrough', realm: '凝气→筑基', materials: [{ id: 'youhun_cao', name: '幽魂草', quantity: 3 }, { id: 'ningxue_hua', name: '凝血花', quantity: 2 }], cost: 100, effect: '突破概率 +20%' },
  { id: 'tianli_dan', name: '天离丹', type: 'breakthrough', realm: '筑基→结丹', materials: [{ id: 'ningxue_hua', name: '凝血花', quantity: 4 }, { id: 'longxian_guo', name: '龙涎果', quantity: 1 }], cost: 500, effect: '突破概率 +20%' },
  { id: 'qingyun_dan', name: '青云丹', type: 'breakthrough', realm: '结丹→元婴', materials: [{ id: 'longxian_guo', name: '龙涎果', quantity: 2 }, { id: 'hansui_ye', name: '寒髓叶', quantity: 3 }], cost: 2000, effect: '突破概率 +20%' },
  { id: 'huashen_dan', name: '化神丹', type: 'breakthrough', realm: '元婴→化神', materials: [{ id: 'longxian_guo', name: '龙涎果', quantity: 3 }, { id: 'wannian_lingzhi', name: '万年灵芝', quantity: 1 }], cost: 8000, effect: '突破概率 +20%' },
  { id: 'yingbian_dan', name: '婴变丹', type: 'breakthrough', realm: '化神→婴变', materials: [{ id: 'wannian_lingzhi', name: '万年灵芝', quantity: 2 }, { id: 'qicai_xuelian', name: '七彩雪莲', quantity: 1 }], cost: 30000, effect: '突破概率 +20%' },
  { id: 'wending_dan', name: '问鼎丹', type: 'breakthrough', realm: '婴变→问鼎', materials: [{ id: 'qicai_xuelian', name: '七彩雪莲', quantity: 3 }, { id: 'wannian_lingzhi', name: '万年灵芝', quantity: 3 }], cost: 100000, effect: '突破概率 +20%' },
]

export function getPillCultivationBonus(pillType: string | null): number {
  const bonuses: Record<string, number> = {
    peiyuan_dan: 0.2, qihuang_dan: 0.25, qianji_dan: 0.3, taiyi_dan: 0.35,
    tianyun_dan: 0.4, xuanyuan_dan: 0.45, wendao_dan: 0.5,
  }
  return pillType ? (bonuses[pillType] ?? 0) : 0
}

export function getPillBreakthroughBonus(pillType: string): number {
  return ['zhuji_dan', 'tianli_dan', 'qingyun_dan', 'huashen_dan', 'yingbian_dan', 'wending_dan'].includes(pillType) ? 0.2 : 0
}
