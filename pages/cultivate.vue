<template>
  <div class="min-h-screen flex flex-col bg-ink-950">
    <div class="fixed inset-0 bg-cover bg-center transition-all duration-1000 -z-10" :class="realmBgClass"></div>
    <div class="fixed inset-0 bg-ink-950/60 transition-opacity duration-1000 -z-10"></div>
    <GameHeader />

    <!-- 离线收益呈现（PRD US7）-->
    <div v-if="offlineReport" class="max-w-6xl w-full mx-auto px-4 pt-4">
      <div class="bg-jade-950/40 border border-jade-700/40 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
        <p class="text-jade-200 text-sm">
          出关收获：闭关 <b>{{ Math.floor(offlineReport.minutes / 60) }}</b> 小时
          <b>{{ Math.round(offlineReport.minutes % 60) }}</b> 分，获得灵气
          <b class="text-gold-300">{{ formatNumber(offlineReport.lingqi) }}</b>、灵石
          <b class="text-gold-300">{{ formatNumber(offlineReport.lingshi) }}</b>
        </p>
        <button @click="offlineReport = null"
          class="shrink-0 px-3 py-1.5 bg-jade-700 hover:bg-jade-600 text-white rounded text-xs transition-colors">
          收下
        </button>
      </div>
    </div>

    <div v-if="!c?.nickname" class="flex-1 max-w-6xl w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1 space-y-4">
        <div class="bg-ink-900/70 border border-ink-700 rounded-lg p-6 space-y-4">
          <div class="flex justify-center"><SkeletonBlock height="h-20" width="w-20" extraStyle="border-radius:9999px" /></div>
          <SkeletonBlock height="h-5" width="w-2/3" extraStyle="margin:0 auto" />
          <SkeletonBlock height="h-3" width="w-1/2" extraStyle="margin:0 auto" />
          <div class="space-y-3 pt-4">
            <SkeletonBlock height="h-3" />
            <SkeletonBlock height="h-3" width="w-3/4" />
            <div class="grid grid-cols-2 gap-2"><SkeletonBlock height="h-12" /><SkeletonBlock height="h-12" /></div>
          </div>
        </div>
        <SkeletonBlock height="h-24" />
      </div>
      <div class="lg:col-span-2">
        <SkeletonBlock height="h-64" />
      </div>
    </div>

    <div v-else class="flex-1 max-w-6xl w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Character Info -->
      <div class="lg:col-span-1 space-y-4">
        <!-- Character Card -->
        <div class="bg-ink-900/70 border border-ink-700 rounded-lg p-6 text-center">
          <div class="relative w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-jade-700 to-jade-900 flex items-center justify-center border-2 border-jade-500/30 overflow-hidden">
            <img src="/images/decorations/breakthrough-circle.webp" alt="" class="absolute inset-0 w-full h-full object-cover opacity-30" />
            <span class="font-title text-2xl text-gold-400 relative z-10">{{ c.nickname?.[0] || '?' }}</span>
          </div>
          <div class="flex items-center justify-center gap-2">
            <h2 class="font-title text-xl text-gold-300 mb-1">{{ c.nickname || '未知' }}</h2>
            <button @click="showEditProfile = true; editNickname = c.nickname || ''" class="text-ink-400 hover:text-gold-400 transition-colors text-sm mb-1">
              ✎
            </button>
          </div>
          <p class="text-jade-400 text-sm mb-4">{{ realmLabel }} · 第{{ c.realmLayer }}{{ layerUnit }}</p>

          <div class="space-y-3">
            <ResourceBar
              label="修炼进度（灵气）"
              icon="/images/icons/lingqi-icon.webp"
              :current="c.lingqi"
              :max="c.lingqiCap"
              bar-class="bg-jade-600"
            />
            <div class="flex justify-between items-center text-sm bg-ink-800/50 border border-ink-700 rounded-lg px-4 py-2.5">
              <span class="text-ink-300 flex items-center gap-1.5">
                <img src="/images/icons/lingshi-icon.webp" alt="" class="w-5 h-5 inline-block" />
                灵石
              </span>
              <span class="text-gold-400 font-bold">{{ formatNumber(c.lingshi) }}</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs text-ink-400">
              <div class="bg-ink-800/30 rounded p-2 text-center">
                <div>灵气速率</div>
                <div class="text-jade-400 font-bold">{{ c.lingqiRate }}/分钟<span v-if="pillBuffActive" class="ml-0.5 text-gold-400">+{{ Math.round((c.pillBuffRate || 0) * 100) }}%</span></div>
              </div>
              <div class="bg-ink-800/30 rounded p-2 text-center">
                <div>灵石速率</div>
                <div class="text-gold-400 font-bold">{{ c.lingshiRate }}/分钟</div>
              </div>
            </div>
            <div v-if="earlyStageBuffVisible" class="bg-jade-950/30 border border-jade-700/40 rounded-lg p-3 text-left text-xs space-y-1">
              <div class="flex items-center justify-between gap-2">
                <span class="text-jade-300 font-bold">前期加成</span>
                <span class="text-ink-400">{{ earlyStageBuffLabel }}</span>
              </div>
              <div class="text-ink-300">灵气上限 {{ formatNumber(earlyStageConfig.lingqiCap) }}，灵气速率 {{ formatNumber(earlyStageConfig.lingqiRate) }}/分钟</div>
              <div class="text-ink-400">失败保留 {{ Math.round((earlyStageConfig.progressRetainRate || 0) * 100) }}% 进度，连败保底 +{{ Math.round((earlyStageConfig.pityChanceStep || 0) * 100) }}%/次，上限 +{{ Math.round((earlyStageConfig.pityChanceMax || 0) * 100) }}%</div>
            </div>
            <div v-if="showPitySummary" class="bg-ink-800/40 border border-gold-700/30 rounded-lg p-3 text-left text-xs space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="text-gold-300 font-bold">突破保底</span>
                <span class="text-ink-400">连败 {{ c.breakthroughFailureCount || 0 }} 次</span>
              </div>
              <div class="text-ink-300">当前保底加成 +{{ Math.round(currentPityBonus * 100) }}%，当前突破概率 {{ Math.round(effectiveBreakthroughChance * 100) }}%</div>
              <div class="h-2 rounded-full bg-ink-950 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-jade-700 to-gold-500 transition-all duration-300" :style="{ width: pityProgressPercent + '%' }"></div>
              </div>
            </div>
          </div>

          <!-- Breakthrough Button：仅大境界瓶颈需要主动突破；小境界由结算自动晋升（PRD US8） -->
          <button v-if="isInRealmBreakthrough" @click="showBreakthrough = true"
            class="w-full mt-4 py-3 bg-gradient-to-r from-gold-700 to-gold-600 hover:from-gold-600 hover:to-gold-500 text-white rounded font-bold tracking-wider transition-all duration-300 animate-breath-glow">
            突 破
          </button>
          <div v-else-if="canBreakthrough" class="w-full mt-4 py-3 text-center text-jade-300 text-sm border border-jade-700/40 rounded bg-jade-950/20">
            灵气圆满，闭关冲击下一层中…
          </div>
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
            <div v-if="signInStatus.signedIn" class="text-jade-400 text-sm font-bold">[V] 已签到</div>
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
            <div v-for="item in inventory" :key="item.id" class="flex justify-between items-center text-sm text-ink-200 gap-2">
              <span class="truncate">{{ item.name }} <span class="text-ink-400">×{{ item.quantity }}</span></span>
              <button v-if="item.itemType === 'pill'" @click="consumePill(item.itemId)" :disabled="!!consuming"
                class="shrink-0 px-2 py-0.5 bg-jade-700 hover:bg-jade-600 disabled:bg-ink-700 disabled:text-ink-500 text-white rounded text-xs transition-colors">
                {{ consuming === item.itemId ? '…' : '服用' }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="actionFeedback" class="rounded-lg p-4 text-sm border" :class="actionTone === 'ok' ? 'bg-jade-950/30 border-jade-700/30 text-jade-200' : 'bg-blood-950/30 border-blood-700/30 text-blood-200'">
          {{ actionFeedback }}
        </div>
      </div>

      <!-- Right: Chat -->
      <div class="lg:col-span-2">
        <ChatTabContainer class="min-h-[520px]" />
      </div>
    </div>

    <!-- Adventure Event Modal -->
    <Teleport to="body">
      <div v-if="adventureEvent" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" @click.self="adventureEvent = null">
        <div class="bg-ink-900 border border-gold-600/30 rounded-lg w-full max-w-md p-6 mx-4 shadow-2xl">
          <h3 class="font-title text-xl text-gold-400 mb-2 text-center">{{ adventureEvent.data.title }}</h3>
          <p class="text-ink-300 text-sm mb-4 text-center">{{ adventureEvent.data.description }}</p>
          <div v-if="!adventureResult" class="space-y-2">
            <button v-for="choice in adventureEvent.data.choices" :key="choice.index" @click="handleAdventureChoice(choice.index)"
              class="w-full py-2.5 px-4 bg-ink-800 hover:bg-ink-700 border border-ink-600 rounded text-sm text-ink-200 text-left transition-colors">
              <span class="text-gold-400 font-bold">{{ choice.label }}</span>
              <span class="text-ink-400 block text-xs mt-0.5">{{ choice.desc }}</span>
            </button>
          </div>
          <div v-else class="text-center">
            <p class="text-jade-400 text-sm mb-4">{{ adventureResult.message }}</p>
            <button @click="adventureEvent = null; adventureResult = null" class="px-4 py-2 bg-ink-700 hover:bg-ink-600 text-ink-200 rounded text-sm transition-colors">关闭</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Edit Profile Modal -->
    <Teleport to="body">
      <div v-if="showEditProfile" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" @click.self="showEditProfile = false">
        <div class="bg-ink-900 border border-ink-700 rounded-lg w-full max-w-sm p-6 mx-4">
          <h3 class="font-title text-xl text-gold-400 mb-4 text-center">修改道号</h3>
          <input v-model="editNickname" type="text" maxlength="20" placeholder="输入新道号"
            class="w-full px-4 py-2.5 bg-ink-950 border border-ink-600 rounded focus:border-jade-500 focus:outline-none text-ink-100 placeholder-ink-500 mb-4" />
          <div v-if="editError" class="text-blood-400 text-sm mb-3">{{ editError }}</div>
          <div class="flex gap-3">
            <button @click="showEditProfile = false" class="flex-1 py-2 bg-ink-700 hover:bg-ink-600 text-ink-200 rounded transition-colors">取消</button>
            <button @click="handleSaveProfile" :disabled="savingProfile" class="flex-1 py-2 bg-jade-700 hover:bg-jade-600 disabled:bg-ink-700 disabled:text-ink-500 text-white rounded transition-colors">
              {{ savingProfile ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <BreakthroughModal
      :show="showBreakthrough"
      :current-realm-label="realmLabel"
      :next-realm-label="nextRealmLabel"
      :base-chance="baseChance"
      :effective-chance="effectiveBreakthroughChance"
      :pity-bonus="currentPityBonus"
      :failure-count="c?.breakthroughFailureCount || 0"
      :pity-chance-max="earlyStageConfig?.pityChanceMax || 0"
      :has-pill-in-inventory="hasBreakthroughPill"
      :result="breakthroughResult"
      @close="showBreakthrough = false; breakthroughResult = null"
      @attempt="attemptBreakthrough"
      @go-alchemy="router.push('/alchemy?filter=breakthrough'); showBreakthrough = false"
    />
  </div>
</template>

<script setup lang="ts">
import { auth } from '~/composables/useAuth'
import { useChat } from '~/composables/useChat'
import { useGameLoop } from '~/composables/useGameLoop'

const router = useRouter()
const gameLog = useGameLoop()
const offlineReport = gameLog.offlineReport
const chat = useChat()
const c = auth.character // top-level ref for template auto-unwrap
const actionFeedback = ref('')
const actionTone = ref<'ok' | 'err'>('ok')

function setActionFeedback(message: string, tone: 'ok' | 'err' = 'ok') {
  actionFeedback.value = message
  actionTone.value = tone
}

// Sign-in state
const signInStatus = reactive({ signedIn: false, consecutiveDays: 0 })
const signingIn = ref(false)
const signInReward = ref(0)

// Profile edit
const showEditProfile = ref(false)
const editNickname = ref('')
const editError = ref('')
const savingProfile = ref(false)

async function handleSaveProfile() {
  editError.value = ''
  savingProfile.value = true
  try {
    await $fetch('/api/auth/profile', {
      method: 'PUT',
      headers: auth.getHeaders(),
      body: { nickname: editNickname.value },
    })
    await auth.fetchMe()
    showEditProfile.value = false
  } catch (e) {
    editError.value = e.data?.message || e.message || '保存失败'
  } finally {
    savingProfile.value = false
  }
}

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
    setActionFeedback(`签到成功，获得 ${res.reward} 灵石`, 'ok')
    await auth.fetchMe() // refresh lingshi
  } catch (e) {
    setActionFeedback('签到失败：' + (e.data?.message || e.message || '未知错误'), 'err')
  } finally {
    signingIn.value = false
  }
}

// Adventure events
const adventureEvent = ref(null)
const adventureResult = ref(null)

async function checkAdventure() {
  if (adventureEvent.value) return // already showing
  try {
    const res = await $fetch('/api/adventure/pending', { headers: auth.getHeaders() })
    if (res.event) {
      adventureEvent.value = res.event
    }
  } catch { /* ignore */ }
}

async function handleAdventureChoice(choice) {
  try {
    const res = await $fetch('/api/adventure/resolve', {
      method: 'POST',
      headers: auth.getHeaders(),
      body: { choice },
    })
    adventureResult.value = res
    setActionFeedback('奇遇：' + res.message, 'ok')
    await auth.fetchMe()
    await fetchInventory()
  } catch (e) {
    setActionFeedback('奇遇失败：' + (e.data?.message || e.message || '未知错误'), 'err')
  }
}

let adventureTimer: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  if (!auth.isLoggedIn()) {
    router.push('/')
    return
  }
  // 互不依赖的初始化并行执行，加快进入修炼页的首屏
  await Promise.all([auth.fetchMe(), fetchSignInStatus(), fetchInventory(), loadGameConfig()])
  // fetchMe 失败会清除登录态（token 过期/被撤销）——回登录页而不是留在死页面
  if (!auth.isLoggedIn()) {
    router.push('/')
    return
  }
  chat.connect() // 不阻塞渲染：内部自行拉取未读并订阅 Pusher
  gameLog.start()
  adventureTimer = setInterval(checkAdventure, 30000)
  checkAdventure()
})

onUnmounted(() => {
  if (adventureTimer) clearInterval(adventureTimer)
})

// Game config from API
const gameConfig = ref(null)

async function loadGameConfig() {
  try { gameConfig.value = await $fetch('/api/config/game') } catch (_) { /* ignore */ }
}

// Realm background mapping
const bgMap = {
  condensing_qi: 'bg-realm-condensing', foundation: 'bg-realm-foundation',
  core_formation: 'bg-realm-core', nascent_soul: 'bg-realm-nascent',
  deity_transformation: 'bg-realm-deity', nascent_transformation: 'bg-realm-nascent-trans',
  seeking_heaven: 'bg-realm-seeking',
}
const realmBgClass = computed(() => bgMap[c.value?.realm] || 'bg-cultivate-bg')

// Realm display
const realmLabel = computed(() => {
  if (!gameConfig.value?.realms || !c.value?.realm) return c.value?.realm || ''
  const r = gameConfig.value.realms.find((r) => r.key === c.value.realm)
  return r?.label || c.value.realm
})

const layerUnit = computed(() => {
  if (c.value?.realm === 'condensing_qi') return '层'
  return c.value?.realmLayer === 1 ? '（初期）' : c.value?.realmLayer === 2 ? '（中期）' : '（后期）'
})

const nextRealmLabel = computed(() => {
  if (!gameConfig.value?.realms || !c.value?.realm) return ''
  const idx = gameConfig.value.realms.findIndex((r) => r.key === c.value.realm)
  const next = gameConfig.value.realms[idx + 1]
  return next?.label || ''
})

const canBreakthrough = computed(() => {
  if (!c.value) return false
  return parseFloat(c.value.lingqi) >= parseFloat(c.value.lingqiCap)
})

const baseChance = computed(() => {
  if (!gameConfig.value?.realms || !c.value?.realm) return 0.15
  const r = gameConfig.value.realms.find((r) => r.key === c.value.realm)
  return r?.breakthroughChance || 0.15
})

const earlyStageConfig = computed(() => {
  if (!gameConfig.value?.realms || !c.value?.realm) return null
  return gameConfig.value.realms.find((r) => r.key === c.value.realm) || null
})

const earlyStageBuffVisible = computed(() => {
  return !!earlyStageConfig.value?.progressRetainRate
})

const earlyStageBuffLabel = computed(() => {
  if (!c.value?.realm) return ''
  return c.value.realm === 'condensing_qi' ? '凝气期加速中' : '筑基期加速中'
})

const currentPityBonus = computed(() => {
  if (!earlyStageConfig.value?.pityChanceStep || !earlyStageConfig.value?.pityChanceMax || !c.value) return 0
  return Math.min((c.value.breakthroughFailureCount || 0) * earlyStageConfig.value.pityChanceStep, earlyStageConfig.value.pityChanceMax)
})

const effectiveBreakthroughChance = computed(() => Math.min(baseChance.value + currentPityBonus.value, 0.9))

const pityProgressPercent = computed(() => {
  if (!earlyStageConfig.value?.pityChanceMax) return 0
  return Math.min((currentPityBonus.value / earlyStageConfig.value.pityChanceMax) * 100, 100)
})

const showPitySummary = computed(() => !!earlyStageConfig.value?.pityChanceMax)

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

// ── 修炼丹服用（PRD US13：限时加速灵气获取）──
const consuming = ref<string | null>(null)
const pillBuffActive = computed(() => {
  const until = c.value?.pillBuffUntil
  return !!until && new Date(until).getTime() > Date.now()
})

async function consumePill(itemId: string) {
  consuming.value = itemId
  try {
    const res = await $fetch('/api/alchemy/consume', {
      method: 'POST',
      headers: auth.getHeaders(),
      body: { itemId },
    })
    setActionFeedback(res.message, 'ok')
    await Promise.all([auth.fetchMe(), fetchInventory()])
  } catch (e) {
    setActionFeedback('服用失败：' + (e.data?.message || e.message || '未知错误'), 'err')
  } finally {
    consuming.value = null
  }
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
    setActionFeedback(res.message, res.success ? 'ok' : 'err')
    if (res.success) {
      if (res.worldBroadcast && !chat.isRealtimeEnabled.value) {
        chat.appendWorldMessage(res.worldBroadcast)
      }
      await auth.fetchMe()
      await fetchInventory()
      gameLog.sync()
    } else if (auth.character.value) {
      auth.character.value = res.character
    }
  } catch (e) {
    setActionFeedback('突破失败：' + (e.data?.message || e.message || '未知错误'), 'err')
  }
}

function formatNumber(n) {
  const num = parseFloat(n)
  if (num >= 1e8) return (num / 1e8).toFixed(2) + '亿'
  if (num >= 1e4) return (num / 1e4).toFixed(2) + '万'
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 0 })
}
</script>
