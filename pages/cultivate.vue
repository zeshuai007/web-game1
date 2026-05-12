<template>
  <div class="min-h-screen flex flex-col bg-ink-950">
    <div class="fixed inset-0 bg-cover bg-center transition-all duration-1000 -z-10" :class="realmBgClass"></div>
    <div class="fixed inset-0 bg-ink-950/60 transition-opacity duration-1000 -z-10"></div>
    <GameHeader />

    <div v-if="!c?.nickname" class="flex-1 flex items-center justify-center">
      <p class="text-ink-400 animate-pulse">加载中...</p>
    </div>

    <div v-else class="flex-1 max-w-6xl w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Character Info -->
      <div class="lg:col-span-1 space-y-4">
        <!-- Character Card -->
        <div class="bg-ink-900/70 border border-ink-700 rounded-lg p-6 text-center">
          <div class="relative w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-jade-700 to-jade-900 flex items-center justify-center border-2 border-jade-500/30 overflow-hidden">
            <img src="/images/decorations/breakthrough-circle.png" alt="" class="absolute inset-0 w-full h-full object-cover opacity-30" />
            <span class="font-title text-2xl text-gold-400 relative z-10">{{ c.nickname?.[0] || '?' }}</span>
          </div>
          <h2 class="font-title text-xl text-gold-300 mb-1">{{ c.nickname || '未知' }}</h2>
          <p class="text-jade-400 text-sm mb-4">{{ realmLabel }} · 第{{ c.realmLayer }}{{ layerUnit }}</p>

          <div class="space-y-3">
            <ResourceBar
              label="修炼进度（灵气）"
              icon="/images/icons/lingqi-icon.png"
              :current="c.lingqi"
              :max="c.lingqiCap"
              bar-class="bg-jade-600"
            />
            <div class="flex justify-between items-center text-sm bg-ink-800/50 border border-ink-700 rounded-lg px-4 py-2.5">
              <span class="text-ink-300 flex items-center gap-1.5">
                <img src="/images/icons/lingshi-icon.png" alt="" class="w-5 h-5 inline-block" />
                灵石
              </span>
              <span class="text-gold-400 font-bold">{{ formatNumber(c.lingshi) }}</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs text-ink-400">
              <div class="bg-ink-800/30 rounded p-2 text-center">
                <div>灵气速率</div>
                <div class="text-jade-400 font-bold">{{ c.lingqiRate }}/分钟</div>
              </div>
              <div class="bg-ink-800/30 rounded p-2 text-center">
                <div>灵石速率</div>
                <div class="text-gold-400 font-bold">{{ c.lingshiRate }}/分钟</div>
              </div>
            </div>
          </div>

          <!-- Breakthrough Button -->
          <button v-if="canBreakthrough" @click="showBreakthrough = true"
            class="w-full mt-4 py-3 bg-gradient-to-r from-gold-700 to-gold-600 hover:from-gold-600 hover:to-gold-500 text-white rounded font-bold tracking-wider transition-all duration-300 animate-breath-glow">
            突 破
          </button>
        </div>

        <!-- Sign-in Card -->
        <div class="bg-ink-900/70 border border-ink-700 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm text-ink-400 uppercase tracking-wider">每日签到</h3>
              <p v-if="signInStatus.signedIn" class="text-xs text-jade-400 mt-1">
                已签到 {{ signInStatus.consecutiveDays }} 天
              </p>
              <p v-else class="text-xs text-ink-500 mt-1">
                连续 {{ signInStatus.consecutiveDays || 0 }} 天
              </p>
            </div>
            <button v-if="!signInStatus.signedIn" @click="handleSignIn" :disabled="signingIn"
              class="px-4 py-2 bg-gold-700 hover:bg-gold-600 disabled:bg-ink-700 disabled:text-ink-500 text-white rounded text-sm transition-colors">
              {{ signingIn ? '签到中...' : '签到' }}
            </button>
            <div v-else class="text-jade-400 text-sm font-bold">✓ 已签到</div>
          </div>
          <div v-if="signInReward > 0" class="mt-2 text-xs text-gold-400">
            获得 {{ signInReward }} 灵石奖励
          </div>
        </div>

        <!-- Inventory Summary -->
        <div class="bg-ink-900/70 border border-ink-700 rounded-lg p-4">
          <h3 class="text-sm text-ink-400 uppercase tracking-wider mb-2">背包</h3>
          <div v-if="inventory.length === 0" class="text-ink-500 text-sm text-center py-2">空空如也</div>
          <div v-else class="space-y-1 max-h-40 overflow-y-auto">
            <div v-for="item in inventory" :key="item.id" class="flex justify-between text-sm text-ink-200">
              <span>{{ item.name }}</span>
              <span class="text-ink-400">×{{ item.quantity }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Event Log -->
      <div class="lg:col-span-2">
        <div class="bg-ink-900/70 border border-ink-700 rounded-lg p-6 h-full flex flex-col">
          <h3 class="text-sm text-ink-400 uppercase tracking-wider mb-4">修炼日志</h3>

          <div class="flex-1 space-y-2 overflow-y-auto max-h-[600px]">
            <div v-if="gameLog.events.length === 0" class="text-ink-500 text-sm text-center py-8">
              尚未开始修炼...
            </div>
            <div v-for="(event, idx) in gameLog.events" :key="idx"
              class="text-sm text-ink-300 border-l-2 border-ink-700 pl-3 py-1 hover:border-jade-600 transition-colors">
              {{ event }}
            </div>
          </div>

          <div class="mt-4 text-center text-ink-500 text-xs">
            每15秒自动同步修炼进度 · 离线收益自动结算
          </div>
        </div>
      </div>
    </div>

    <BreakthroughModal
      :show="showBreakthrough"
      :current-realm-label="realmLabel"
      :next-realm-label="nextRealmLabel"
      :base-chance="baseChance"
      :has-pill-in-inventory="hasBreakthroughPill"
      :result="breakthroughResult"
      @close="showBreakthrough = false; breakthroughResult = null"
      @attempt="attemptBreakthrough"
    />
  </div>
</template>

<script setup>
import { auth } from '~/composables/useAuth'
import { useGameLoop } from '~/composables/useGameLoop'

const router = useRouter()
const gameLog = useGameLoop()
const c = auth.character // top-level ref for template auto-unwrap

// Sign-in state
const signInStatus = reactive({ signedIn: false, consecutiveDays: 0 })
const signingIn = ref(false)
const signInReward = ref(0)

async function fetchSignInStatus() {
  try {
    const res = await $fetch('/api/sign-in/status', { headers: auth.getHeaders() })
    signInStatus.signedIn = res.signedIn
    signInStatus.consecutiveDays = res.consecutiveDays
  } catch { /* ignore */ }
}

async function handleSignIn() {
  signingIn.value = true
  try {
    const res = await $fetch('/api/sign-in', {
      method: 'POST',
      headers: auth.getHeaders(),
    })
    signInStatus.signedIn = true
    signInStatus.consecutiveDays = res.consecutiveDays
    signInReward.value = res.reward
    await auth.fetchMe() // refresh lingshi
  } catch (e) {
    gameLog.addEvent('签到失败：' + (e.data?.message || e.message || '未知错误'))
  } finally {
    signingIn.value = false
  }
}

onMounted(async () => {
  if (!auth.isLoggedIn()) {
    router.push('/')
    return
  }
  await auth.fetchMe()
  await fetchSignInStatus()
  await fetchInventory()
  gameLog.start()
})

// Realm background mapping
const realmBgClass = computed(() => {
  const map = {
    condensing_qi: 'bg-realm-condensing',
    foundation: 'bg-realm-foundation',
    core_formation: 'bg-realm-core',
    nascent_soul: 'bg-realm-nascent',
    deity_transformation: 'bg-realm-deity',
    nascent_transformation: 'bg-realm-nascent-trans',
    seeking_heaven: 'bg-realm-seeking',
  }
  return map[c.value?.realm] || 'bg-cultivate-bg'
})

// Realm display
const realmLabel = computed(() => {
  const labels = {
    condensing_qi: '凝气期',
    foundation: '筑基期',
    core_formation: '结丹期',
    nascent_soul: '元婴期',
    deity_transformation: '化神期',
    nascent_transformation: '婴变期',
    seeking_heaven: '问鼎期',
  }
  return labels[c.value?.realm] || c.value?.realm || ''
})

const layerUnit = computed(() => {
  if (c.value?.realm === 'condensing_qi') return '层'
  return c.value?.realmLayer === 1 ? '（初期）' : c.value?.realmLayer === 2 ? '（中期）' : '（后期）'
})

const nextRealmLabel = computed(() => {
  const next = {
    condensing_qi: '筑基期',
    foundation: '结丹期',
    core_formation: '元婴期',
    nascent_soul: '化神期',
    deity_transformation: '婴变期',
    nascent_transformation: '问鼎期',
    seeking_heaven: null,
  }
  return next[c.value?.realm] || ''
})

const canBreakthrough = computed(() => {
  if (!c.value) return false
  return parseFloat(c.value.lingqi) >= parseFloat(c.value.lingqiCap)
})

const baseChance = computed(() => {
  const chances = {
    condensing_qi: 0.5,
    foundation: 0.4,
    core_formation: 0.3,
    nascent_soul: 0.25,
    deity_transformation: 0.2,
    nascent_transformation: 0.15,
  }
  return chances[c.value?.realm] || 0.15
})

// Inventory
const inventory = ref([])
const isInRealmBreakthrough = computed(() => {
  if (!c.value) return false
  const realm = c.value.realm
  const layer = c.value.realmLayer
  const maxLayer = realm === 'condensing_qi' ? 9 : 3
  return parseFloat(c.value.lingqi) >= parseFloat(c.value.lingqiCap) && layer >= maxLayer && realm !== 'seeking_heaven'
})

const hasBreakthroughPill = computed(() => {
  const pillMap = {
    condensing_qi: 'zhuji_dan',
    foundation: 'tianli_dan',
    core_formation: 'qingyun_dan',
    nascent_soul: 'huashen_dan',
    deity_transformation: 'yingbian_dan',
    nascent_transformation: 'wending_dan',
  }
  const pillId = pillMap[c.value?.realm]
  if (!pillId) return false
  return inventory.value.some(i => i.itemId === pillId && i.quantity > 0)
})

async function fetchInventory() {
  try {
    const res = await $fetch('/api/inventory', { headers: auth.getHeaders() })
    inventory.value = res.items
  } catch { /* ignore */ }
}

// Breakthrough
const showBreakthrough = ref(false)
const breakthroughResult = ref(null)

async function attemptBreakthrough(usePill) {
  try {
    const res = await $fetch('/api/cultivate/breakthrough', {
      method: 'POST',
      headers: auth.getHeaders(),
      body: { usePill },
    })
    breakthroughResult.value = res
    gameLog.addEvent(res.message)
    if (res.success) {
      await auth.fetchMe()
      await fetchInventory()
      gameLog.sync()
    }
  } catch (e) {
    gameLog.addEvent('突破失败：' + (e.data?.message || e.message || '未知错误'))
  }
}

function formatNumber(n) {
  const num = parseFloat(n)
  if (num >= 1e8) return (num / 1e8).toFixed(2) + '亿'
  if (num >= 1e4) return (num / 1e4).toFixed(2) + '万'
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 0 })
}
</script>
