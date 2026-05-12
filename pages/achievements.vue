<template>
  <div class="min-h-screen flex flex-col bg-ink-950">
    <GameHeader />
    <div class="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
      <h2 class="font-title text-2xl text-gold-400 mb-6 text-center tracking-wider">成 就</h2>

      <!-- Category tabs -->
      <div class="flex justify-center gap-2 mb-6 flex-wrap">
        <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
          class="px-4 py-1.5 rounded text-sm transition-colors"
          :class="activeTab === tab.key ? 'bg-gold-700 text-white' : 'bg-ink-800 text-ink-300 hover:bg-ink-700'">
          {{ tab.label }} ({{ counts[tab.key] || 0 }}/{{ tab.total }})
        </button>
      </div>

      <!-- Achievement list -->
      <div v-if="loading" class="space-y-3">
        <div v-for="n in 6" :key="n" class="bg-ink-900/70 border border-ink-700 rounded-lg p-4 space-y-2">
          <SkeletonBlock height="h-5" width="w-1/2" />
          <SkeletonBlock height="h-3" />
        </div>
      </div>

      <div v-else class="space-y-3">
        <div v-for="ach in filteredAchievements" :key="ach.key"
          class="bg-ink-900/70 border rounded-lg p-4 flex items-center justify-between transition-colors"
          :class="ach.completed ? 'border-gold-600/50' : 'border-ink-700'">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-lg" :class="ach.completed ? '' : 'opacity-30'">{{ icons[ach.category] || '🏆' }}</span>
              <h3 class="font-bold" :class="ach.completed ? 'text-gold-300' : 'text-ink-400'">{{ ach.name }}</h3>
              <span v-if="ach.completed && ach.claimed" class="text-xs text-jade-400">✓ 已领取</span>
              <span v-else-if="ach.completed" class="text-xs text-gold-400">✦ 可领取</span>
            </div>
            <p class="text-sm text-ink-400 mt-0.5">{{ ach.description }}</p>
            <div class="flex items-center gap-3 mt-1 text-xs text-ink-500">
              <span>奖励: {{ ach.rewardValue }} 灵石</span>
              <span v-if="!ach.completed" class="text-ink-500">
                进度: {{ ach.progress }}/{{ ach.conditionValue }}
              </span>
            </div>
          </div>
          <div class="ml-3">
            <button v-if="ach.completed && !ach.claimed" @click="claimReward(ach.key)"
              class="px-3 py-1.5 bg-gold-700 hover:bg-gold-600 text-white rounded text-xs transition-colors">
              领取
            </button>
            <div v-else-if="!ach.completed" class="w-20 bg-ink-800 rounded-full h-1.5">
              <div class="bg-jade-600 h-1.5 rounded-full transition-all" :style="{ width: Math.min(100, (ach.progress / ach.conditionValue) * 100) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="message" class="mt-4 text-center text-sm" :class="msgType === 'ok' ? 'text-jade-400' : 'text-blood-400'">{{ message }}</div>
    </div>
  </div>
</template>

<script setup>
import { auth } from '~/composables/useAuth'
const router = useRouter()

const achievements = ref([])
const loading = ref(true)
const activeTab = ref('all')
const message = ref('')
const msgType = ref('ok')

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'realm', label: '修为' },
  { key: 'alchemy', label: '炼丹' },
  { key: 'social', label: '社交' },
  { key: 'forge', label: '炼器' },
]

const icons = { realm: '⚔️', alchemy: '⚗️', social: '🤝', forge: '🔨' }

const filteredAchievements = computed(() => {
  if (activeTab.value === 'all') return achievements.value
  return achievements.value.filter(a => a.category === activeTab.value)
})

const counts = computed(() => {
  const result = {}
  for (const tab of tabs) {
    if (tab.key === 'all') continue
    const group = achievements.value.filter(a => a.category === tab.key)
    result[tab.key] = group.filter(a => a.completed).length
    result[tab.key + '_total'] = group.length
  }
  return result
})

onMounted(async () => {
  if (!auth.isLoggedIn()) { router.push('/'); return }
  try {
    const res = await $fetch('/api/achievement/list', { headers: auth.getHeaders() })
    achievements.value = res.achievements
  } catch { /* ignore */ }
  loading.value = false
})

async function claimReward(key) {
  try {
    const res = await $fetch('/api/achievement/claim', {
      method: 'POST', headers: auth.getHeaders(), body: { achievementKey: key },
    })
    message.value = res.message
    msgType.value = 'ok'
    // Refresh
    const list = await $fetch('/api/achievement/list', { headers: auth.getHeaders() })
    achievements.value = list.achievements
    await auth.fetchMe()
  } catch (e) {
    message.value = e.data?.message || e.message || '领取失败'
    msgType.value = 'err'
  }
}
</script>
