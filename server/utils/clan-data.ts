export const clanLevelExp = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5000]

export function getClanLevelBonus(level: number): number {
  return (level - 1) * 0.02
}

export const dailyClanTasks = [
  { taskType: 'collect_herb', title: '采集灵草', description: '收集任意炼丹材料', targetCount: 3, rewardExp: 10, rewardContribution: 10 },
  { taskType: 'gain_lingqi', title: '勤修苦练', description: '获得灵气', targetCount: 500, rewardExp: 15, rewardContribution: 15 },
  { taskType: 'dao_with_member', title: '宗门论道', description: '与宗门成员论道', targetCount: 1, rewardExp: 20, rewardContribution: 20 },
  { taskType: 'forge_item', title: '锻造装备', description: '锻造任意装备', targetCount: 1, rewardExp: 25, rewardContribution: 25 },
]
