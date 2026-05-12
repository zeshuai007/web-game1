import { pillNames, materialNames, realmConfigs, type Realm } from '../../utils/game-engine'
import { pillTypeEnum, type PillType, characters } from '../../db/schema'
import { eq } from 'drizzle-orm'

interface PillRecipe {
  id: string
  name: string
  type: 'cultivation' | 'breakthrough'
  realm: string
  materials: { name: string; id: string; quantity: number }[]
  cost: number
  effect: string
}

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const db = useDB()

  const [char] = await db.select().from(characters).where(eq(characters.userId, userId))

  const recipes: PillRecipe[] = [
    // Cultivation pills
    { id: 'peiyuan_dan', name: '培元丹', type: 'cultivation', realm: '凝气期', materials: [{ name: '幽魂草', id: 'youhun_cao', quantity: 2 }, { name: '凝血花', id: 'ningxue_hua', quantity: 1 }], cost: 50, effect: '修炼速度 +20%' },
    { id: 'qihuang_dan', name: '岐黄丹', type: 'cultivation', realm: '筑基期', materials: [{ name: '幽魂草', id: 'youhun_cao', quantity: 3 }, { name: '寒髓叶', id: 'hansui_ye', quantity: 2 }], cost: 200, effect: '修炼速度 +25%' },
    { id: 'qianji_dan', name: '千机丹', type: 'cultivation', realm: '结丹期', materials: [{ name: '凝血花', id: 'ningxue_hua', quantity: 3 }, { name: '寒髓叶', id: 'hansui_ye', quantity: 3 }], cost: 800, effect: '修炼速度 +30%' },
    { id: 'taiyi_dan', name: '太乙丹', type: 'cultivation', realm: '元婴期', materials: [{ name: '龙涎果', id: 'longxian_guo', quantity: 2 }, { name: '寒髓叶', id: 'hansui_ye', quantity: 4 }], cost: 3000, effect: '修炼速度 +35%' },
    { id: 'tianyun_dan', name: '天韵丹', type: 'cultivation', realm: '化神期', materials: [{ name: '龙涎果', id: 'longxian_guo', quantity: 3 }, { name: '万年灵芝', id: 'wannian_lingzhi', quantity: 2 }], cost: 10000, effect: '修炼速度 +40%' },
    { id: 'xuanyuan_dan', name: '玄元丹', type: 'cultivation', realm: '婴变期', materials: [{ name: '万年灵芝', id: 'wannian_lingzhi', quantity: 3 }, { name: '七彩雪莲', id: 'qicai_xuelian', quantity: 2 }], cost: 50000, effect: '修炼速度 +45%' },
    { id: 'wendao_dan', name: '问道丹', type: 'cultivation', realm: '问鼎期', materials: [{ name: '七彩雪莲', id: 'qicai_xuelian', quantity: 4 }, { name: '万年灵芝', id: 'wannian_lingzhi', quantity: 4 }], cost: 200000, effect: '修炼速度 +50%' },
    // Breakthrough pills
    { id: 'zhuji_dan', name: '筑基丹', type: 'breakthrough', realm: '凝气→筑基', materials: [{ name: '幽魂草', id: 'youhun_cao', quantity: 3 }, { name: '凝血花', id: 'ningxue_hua', quantity: 2 }], cost: 100, effect: '突破概率 +20%' },
    { id: 'tianli_dan', name: '天离丹', type: 'breakthrough', realm: '筑基→结丹', materials: [{ name: '凝血花', id: 'ningxue_hua', quantity: 4 }, { name: '龙涎果', id: 'longxian_guo', quantity: 1 }], cost: 500, effect: '突破概率 +20%' },
    { id: 'qingyun_dan', name: '青云丹', type: 'breakthrough', realm: '结丹→元婴', materials: [{ name: '龙涎果', id: 'longxian_guo', quantity: 2 }, { name: '寒髓叶', id: 'hansui_ye', quantity: 3 }], cost: 2000, effect: '突破概率 +20%' },
    { id: 'huashen_dan', name: '化神丹', type: 'breakthrough', realm: '元婴→化神', materials: [{ name: '龙涎果', id: 'longxian_guo', quantity: 3 }, { name: '万年灵芝', id: 'wannian_lingzhi', quantity: 1 }], cost: 8000, effect: '突破概率 +20%' },
    { id: 'yingbian_dan', name: '婴变丹', type: 'breakthrough', realm: '化神→婴变', materials: [{ name: '万年灵芝', id: 'wannian_lingzhi', quantity: 2 }, { name: '七彩雪莲', id: 'qicai_xuelian', quantity: 1 }], cost: 30000, effect: '突破概率 +20%' },
    { id: 'wending_dan', name: '问鼎丹', type: 'breakthrough', realm: '婴变→问鼎', materials: [{ name: '七彩雪莲', id: 'qicai_xuelian', quantity: 3 }, { name: '万年灵芝', id: 'wannian_lingzhi', quantity: 3 }], cost: 100000, effect: '突破概率 +20%' },
  ]

  return { recipes }
})
