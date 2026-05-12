export interface AchievementDef {
  key: string
  category: string
  name: string
  description: string
  conditionType: string
  conditionValue: number
  rewardType: string
  rewardValue: number
  sortOrder: number
  materialRewards?: { id: string; qty: number }[]
}

export const achievementDefs: AchievementDef[] = [
  // 修为
  { key: 'to_foundation', category: 'realm', name: '初入修仙', description: '突破至筑基期', conditionType: 'realm', conditionValue: 1, rewardType: 'lingshi+rate', rewardValue: 500, sortOrder: 1, materialRewards: [] },
  { key: 'to_core_formation', category: 'realm', name: '丹道初成', description: '突破至结丹期', conditionType: 'realm', conditionValue: 2, rewardType: 'lingshi+rate', rewardValue: 1500, sortOrder: 2, materialRewards: [] },
  { key: 'to_nascent_soul', category: 'realm', name: '元婴出窍', description: '突破至元婴期', conditionType: 'realm', conditionValue: 3, rewardType: 'lingshi+rate', rewardValue: 5000, sortOrder: 3, materialRewards: [] },
  { key: 'to_deity', category: 'realm', name: '元神大成', description: '突破至化神期', conditionType: 'realm', conditionValue: 4, rewardType: 'lingshi+rate', rewardValue: 15000, sortOrder: 4, materialRewards: [] },
  { key: 'to_nascent_trans', category: 'realm', name: '仙体蜕变', description: '突破至婴变期', conditionType: 'realm', conditionValue: 5, rewardType: 'lingshi+rate', rewardValue: 50000, sortOrder: 5, materialRewards: [] },
  { key: 'to_seeking_heaven', category: 'realm', name: '问鼎大道', description: '突破至问鼎期', conditionType: 'realm', conditionValue: 6, rewardType: 'lingshi+rate', rewardValue: 200000, sortOrder: 6, materialRewards: [] },

  // 炼丹
  { key: 'craft_10', category: 'alchemy', name: '初学炼丹', description: '炼制丹药 10 次', conditionType: 'alchemy_count', conditionValue: 10, rewardType: 'lingshi', rewardValue: 100, sortOrder: 7 },
  { key: 'craft_50', category: 'alchemy', name: '熟练丹师', description: '炼制丹药 50 次', conditionType: 'alchemy_count', conditionValue: 50, rewardType: 'lingshi', rewardValue: 500, sortOrder: 8, materialRewards: [{ id: 'longxian_guo', qty: 2 }] },
  { key: 'craft_200', category: 'alchemy', name: '炼丹大师', description: '炼制丹药 200 次', conditionType: 'alchemy_count', conditionValue: 200, rewardType: 'lingshi', rewardValue: 2000, sortOrder: 9, materialRewards: [{ id: 'wannian_lingzhi', qty: 2 }] },
  { key: 'craft_500', category: 'alchemy', name: '丹道宗师', description: '炼制丹药 500 次', conditionType: 'alchemy_count', conditionValue: 500, rewardType: 'lingshi', rewardValue: 10000, sortOrder: 10, materialRewards: [{ id: 'qicai_xuelian', qty: 2 }] },

  // 社交-好友
  { key: 'friends_3', category: 'social', name: '以武会友', description: '拥有 3 位好友', conditionType: 'friend_count', conditionValue: 3, rewardType: 'lingshi', rewardValue: 100, sortOrder: 11 },
  { key: 'friends_10', category: 'social', name: '广结善缘', description: '拥有 10 位好友', conditionType: 'friend_count', conditionValue: 10, rewardType: 'lingshi', rewardValue: 500, sortOrder: 12 },
  { key: 'friends_30', category: 'social', name: '天下皆友', description: '拥有 30 位好友', conditionType: 'friend_count', conditionValue: 30, rewardType: 'lingshi', rewardValue: 3000, sortOrder: 13 },

  // 社交-论道
  { key: 'dao_1', category: 'social', name: '初次论道', description: '论道 1 次', conditionType: 'dao_count', conditionValue: 1, rewardType: 'lingshi', rewardValue: 50, sortOrder: 14 },
  { key: 'dao_50', category: 'social', name: '谈经论道', description: '论道 50 次', conditionType: 'dao_count', conditionValue: 50, rewardType: 'lingshi', rewardValue: 500, sortOrder: 15 },
  { key: 'dao_200', category: 'social', name: '大道争鸣', description: '论道 200 次', conditionType: 'dao_count', conditionValue: 200, rewardType: 'lingshi', rewardValue: 3000, sortOrder: 16 },

  // 炼器-锻造
  { key: 'forge_5', category: 'forge', name: '初涉锻造', description: '锻造装备 5 次', conditionType: 'forge_count', conditionValue: 5, rewardType: 'lingshi', rewardValue: 100, sortOrder: 17 },
  { key: 'forge_30', category: 'forge', name: '铸造师', description: '锻造装备 30 次', conditionType: 'forge_count', conditionValue: 30, rewardType: 'lingshi', rewardValue: 500, sortOrder: 18 },
  { key: 'forge_100', category: 'forge', name: '炼器大师', description: '锻造装备 100 次', conditionType: 'forge_count', conditionValue: 100, rewardType: 'lingshi', rewardValue: 2000, sortOrder: 19 },
  { key: 'forge_300', category: 'forge', name: '神匠', description: '锻造装备 300 次', conditionType: 'forge_count', conditionValue: 300, rewardType: 'lingshi', rewardValue: 10000, sortOrder: 20 },

  // 炼器-品质
  { key: 'quality_lingqi', category: 'forge', name: '灵光一现', description: '锻造出灵器品质装备', conditionType: 'equip_quality', conditionValue: 3, rewardType: 'lingshi', rewardValue: 500, sortOrder: 21 },
  { key: 'quality_xianqi', category: 'forge', name: '仙器问世', description: '锻造出仙器品质装备', conditionType: 'equip_quality', conditionValue: 4, rewardType: 'lingshi', rewardValue: 5000, sortOrder: 22 },
]

/** Fire-and-forget achievement check from within an API handler */
export async function fireAchievementCheck(event: any, eventType: string, realm?: string) {
  try {
    await $fetch('/api/achievement/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': getHeader(event, 'authorization') || '' },
      body: { eventType, realm },
    })
  } catch { /* silent - achievement check is non-critical */ }
}
