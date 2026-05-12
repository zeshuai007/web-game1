import { type Realm, realmEnum } from '../db/schema'
import { realmConfigs } from './realm-config'

export interface AdventureEvent {
  type: string; title: string; description: string
  choices: { label: string; desc: string }[]
  rewards: { type: string; value: number }[]
  baseChance: number
}

export const adventureEvents: AdventureEvent[] = [
  { type: 'spirit_herb', title: '灵草现世', description: '你在修炼中感应到附近有珍贵灵草的气息。', choices: [{ label: '仔细搜索', desc: '花费时间寻找' }, { label: '粗略采集', desc: '快速采集' }], rewards: [{ type: 'material_youhun_cao', value: 3 }, { type: 'material_ningxue_hua', value: 2 }], baseChance: 0.3 },
  { type: 'beast_attack', title: '妖兽袭击', description: '一头妖兽闯入你的修炼之地！', choices: [{ label: '正面迎战', desc: '消耗 50 灵气' }, { label: '避其锋芒', desc: '保全灵气' }], rewards: [{ type: 'lingshi', value: 50 }], baseChance: 0.25 },
  { type: 'mysterious_cave', title: '神秘洞府', description: '发现一处隐藏的洞府。', choices: [{ label: '探索洞府', desc: '消耗 100 灵石' }, { label: '保存实力', desc: '日后再说' }], rewards: [{ type: 'lingshi', value: 300 }], baseChance: 0.15 },
  { type: 'heavenly_blessing', title: '天降机缘', description: '一道灵光从天而降！', choices: [{ label: '全力吸收', desc: '吸收全部灵气' }], rewards: [{ type: 'lingqi', value: 200 }], baseChance: 0.2 },
  { type: 'heart_demon', title: '心魔试炼', description: '心魔悄然来袭。', choices: [{ label: '直面心魔', desc: '下次突破概率提升' }, { label: '固守本心', desc: '巩固修为' }], rewards: [{ type: 'breakthrough_bonus', value: 0.1 }], baseChance: 0.1 },
]

export function rollAdventureEvent(realm: Realm): AdventureEvent | null {
  const realmMultiplier = 1 + (realmEnum.indexOf(realm) * 0.2)
  for (const event of adventureEvents) {
    if (Math.random() < event.baseChance * realmMultiplier) return event
  }
  return null
}
