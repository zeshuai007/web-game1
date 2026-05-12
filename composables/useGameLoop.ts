import { ref, onMounted, onUnmounted } from 'vue'
import { auth } from './useAuth'

export function useGameLoop() {
  const events = ref<string[]>([])
  const intervalId = ref<ReturnType<typeof setInterval> | null>(null)
  const lastUpdate = ref<number>(Date.now())

  async function sync() {
    if (!auth.isLoggedIn()) return
    try {
      const res = await $fetch('/api/cultivate/progress', {
        headers: auth.getHeaders(),
      })
      auth.character.value = res.character
      lastUpdate.value = Date.now()

      if (res.offlineEarnings && res.offlineEarnings.minutes > 0) {
        events.value.unshift(`离线 ${Math.floor(res.offlineEarnings.minutes)} 分钟，获得灵气 ${res.offlineEarnings.lingqi.toFixed(0)}，灵石 ${res.offlineEarnings.lingshi.toFixed(0)}`)
        if (events.value.length > 50) events.value.pop()
      }
    } catch {
      // silent
    }
  }

  function start(intervalMs = 15000) {
    sync()
    intervalId.value = setInterval(sync, intervalMs)
  }

  function stop() {
    if (intervalId.value) {
      clearInterval(intervalId.value)
      intervalId.value = null
    }
  }

  function addEvent(msg: string) {
    events.value.unshift(msg)
    if (events.value.length > 50) events.value.pop()
  }

  onUnmounted(() => stop())

  return { events, sync, start, stop, addEvent, lastUpdate }
}
