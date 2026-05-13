import { ref, onUnmounted } from 'vue'

import { auth } from './useAuth'

export function useGameLoop() {
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

  onUnmounted(() => stop())

  return { sync, start, stop, lastUpdate }
}
