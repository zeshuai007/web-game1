/** 修炼丹 buff 共享常量与工具 */

/** 限时 buff 时长：30 分钟（单槽覆盖制，再次服用刷新） */
export const PILL_BUFF_DURATION_MS = 30 * 60 * 1000

/** 从配方 effect 文案提取加成百分比（如 "修炼速度 +20%" → 0.20） */
export function parsePillBonusRate(effect: string): number {
  const m = /(\d+(?:\.\d+)?)\s*%/.exec(effect || '')
  return m ? parseFloat(m[1]) / 100 : 0
}

/** 角色的丹药 buff 是否仍然有效 */
export function isPillBuffActive(char: { pillBuffUntil?: string | Date | null }): boolean {
  if (!char.pillBuffUntil) return false
  return new Date(char.pillBuffUntil).getTime() > Date.now()
}
