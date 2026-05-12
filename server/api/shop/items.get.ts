import { materialNames } from '../../utils/game-engine'

interface ShopItem {
  id: string
  name: string
  type: string
  description: string
  price: number
}

export default defineEventHandler(async () => {
  const items: ShopItem[] = [
    { id: 'youhun_cao', name: '幽魂草', type: 'material', description: '阴属性灵草，低阶丹药辅料', price: 10 },
    { id: 'ningxue_hua', name: '凝血花', type: 'material', description: '蕴含血气精华，炼体丹药辅料', price: 15 },
    { id: 'hansui_ye', name: '寒髓叶', type: 'material', description: '冰寒属性灵药，中和丹火燥气', price: 25 },
    { id: 'longxian_guo', name: '龙涎果', type: 'material', description: '罕见灵果，高阶丹药药引', price: 100 },
    { id: 'wannian_lingzhi', name: '万年灵芝', type: 'material', description: '极品药材，高阶丹药核心药引', price: 500 },
    { id: 'qicai_xuelian', name: '七彩雪莲', type: 'material', description: '传说级药材，顶级丹药所需', price: 2000 },
  ]

  return { items }
})
