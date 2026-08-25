import { ref, onUnmounted } from 'vue'

import { auth } from './useAuth'

/**
 * 挂机游戏循环（本地插值版）。
 *
 * 挂机产出是线性速率，UI 数值由本地每秒插值平滑累加即可，
 * 服务端校准（sync）降频至约 90 秒一次：
 * - 请求数相比旧的 15s 固定轮询下降 ~80%
 * - 标签页后台被浏览器节流也不丢账：tick 按 dt 补算，回到前台立即对齐
 * - 突破/签到等关键操作后调用 sync() 立即以服务端数据为准
 */
export function useGameLoop() {
  const intervalId = ref<ReturnType<typeof setInterval> | null>(null)
  const tickIntervalId = ref<ReturnType<typeof setInterval> | null>(null)
  const lastUpdate = ref<number>(Date.now())

  /** 本地插值：按速率推进灵气/灵石显示值 */
  function tick() {
    const c = auth.character.value
    if (!c) return
    const now = Date.now()
    const dtMinutes = (now - lastUpdate.value) / 60000
    if (dtMinutes <= 0) return
    lastUpdate.value = now

    const cap = parseFloat(c.lingqiCap)
    const qi = parseFloat(c.lingqi)
    // 灵气圆满后不再增长；灵石无上限
    if (qi < cap) {
      c.lingqi = String(Math.min(qi + parseFloat(c.lingqiRate) * dtMinutes, cap))
    }
    c.lingshi = String(parseFloat(c.lingshi) + parseFloat(c.lingshiRate) * dtMinutes)
  }

  async function sync() {
    if (!auth.isLoggedIn()) return
    try {
      const res = await $fetch('/api/cultivate/progress', {
        headers: auth.getHeaders(),
      })
      auth.character.value = res.character
      lastUpdate.value = Date.now()
    } catch {
      // silent — 本地插值继续，下个周期重试
    }
  }

  function start(intervalMs = 90000) {
    sync()
    intervalId.value = setInterval(sync, intervalMs)
    tickIntervalId.value = setInterval(tick, 1000)
  }

  function stop() {
    if (intervalId.value) {
      clearInterval(intervalId.value)
      intervalId.value = null
    }
    if (tickIntervalId.value) {
      clearInterval(tickIntervalId.value)
      tickIntervalId.value = null
    }
  }

  onUnmounted(() => stop())

  return { sync, start, stop, lastUpdate }
}
