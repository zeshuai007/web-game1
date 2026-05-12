<template>
  <div class="min-h-screen flex flex-col bg-ink-950">
    <GameHeader />
    <div class="flex-1 max-w-4xl w-full mx-auto px-4 py-6 space-y-6">
      <!-- No clan state -->
      <template v-if="!myClan">
        <h2 class="font-title text-2xl text-gold-400 mb-6 text-center tracking-wider">宗 门</h2>

        <div class="bg-ink-900/70 border border-ink-700 rounded-lg p-6 max-w-md mx-auto">
          <h3 class="text-gold-300 font-bold mb-4">创建宗门</h3>
          <input v-model="createName" maxlength="20" placeholder="宗门名称（至少2字符）"
            class="w-full px-4 py-2 bg-ink-950 border border-ink-600 rounded mb-3 text-ink-100 placeholder-ink-500 focus:border-jade-500 focus:outline-none" />
          <input v-model="createDesc" maxlength="100" placeholder="宗门描述（可选）"
            class="w-full px-4 py-2 bg-ink-950 border border-ink-600 rounded mb-3 text-ink-100 placeholder-ink-500 focus:border-jade-500 focus:outline-none" />
          <button @click="handleCreate" :disabled="creating"
            class="w-full py-2 bg-gold-700 hover:bg-gold-600 disabled:bg-ink-700 disabled:text-ink-500 text-white rounded transition-colors">
            {{ creating ? '创建中...' : '创建（消耗500灵石）' }}
          </button>
          <div v-if="createError" class="mt-2 text-blood-400 text-sm">{{ createError }}</div>
        </div>

        <div class="bg-ink-900/70 border border-ink-700 rounded-lg p-6 max-w-md mx-auto">
          <h3 class="text-gold-300 font-bold mb-4">搜索加入</h3>
          <div class="flex gap-2 mb-3">
            <input v-model="searchQuery" @keyup.enter="handleSearch" placeholder="搜索宗门名称..."
              class="flex-1 px-4 py-2 bg-ink-950 border border-ink-600 rounded text-ink-100 placeholder-ink-500 focus:border-jade-500 focus:outline-none" />
            <button @click="handleSearch" class="px-4 py-2 bg-jade-700 hover:bg-jade-600 text-white rounded transition-colors">搜索</button>
          </div>
          <div v-if="searchResults.length > 0" class="space-y-2">
            <div v-for="c in searchResults" :key="c.id" class="flex items-center justify-between bg-ink-800/50 rounded p-3">
              <div>
                <span class="text-ink-200 font-bold">{{ c.name }}</span>
                <span class="text-ink-400 text-sm ml-2">Lv.{{ c.level }} · {{ c.memberCount }}人</span>
              </div>
              <button @click="handleJoin(c.id)" class="px-3 py-1 bg-jade-700 hover:bg-jade-600 text-white rounded text-xs">加入</button>
            </div>
            <p v-if="searchDone && searchResults.length === 0" class="text-ink-500 text-sm text-center">未找到匹配宗门</p>
          </div>
        </div>
      </template>

      <!-- Has clan state -->
      <template v-else>
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-title text-2xl text-gold-400 tracking-wider">{{ myClan.name }}</h2>
          <div class="text-sm text-ink-400">Lv.{{ myClan.level }} · {{ myClan.memberCount }}人</div>
        </div>

        <div class="bg-ink-900/70 border border-ink-700 rounded-lg p-4">
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-sm text-ink-400 uppercase tracking-wider">宗门信息</h3>
            <span v-if="myRole === 'leader'" class="text-xs text-gold-400 px-2 py-0.5 bg-gold-900/30 rounded">宗主</span>
            <span v-else class="text-xs text-jade-400 px-2 py-0.5 bg-jade-900/30 rounded">{{ myRole === 'admin' ? '管理员' : '成员' }}</span>
          </div>
          <p class="text-ink-300 text-sm mb-2">{{ myClan.description || '暂无描述' }}</p>
          <div class="text-xs text-ink-500">宗门经验：{{ myClan.exp }} / 下阶段</div>
        </div>

        <!-- Tasks -->
        <div class="bg-ink-900/70 border border-ink-700 rounded-lg p-4">
          <h3 class="text-sm text-ink-400 uppercase tracking-wider mb-3">每日任务</h3>
          <div v-if="tasks.length === 0" class="text-ink-500 text-sm text-center py-2">暂无任务</div>
          <div v-for="t in tasks" :key="t.id" class="flex items-center justify-between bg-ink-800/50 rounded p-3 mb-2">
            <div class="flex-1">
              <span class="text-ink-200 text-sm font-bold">{{ t.title }}</span>
              <p class="text-xs text-ink-400">{{ t.description }}</p>
              <div class="flex items-center gap-2 mt-1 text-xs text-ink-500">
                <span>进度: {{ t.progress }}/{{ t.targetCount }}</span>
                <span>贡献: +{{ t.rewardContribution }}</span>
              </div>
            </div>
            <button v-if="t.completed && !t.claimed" @click="claimTask(t.id)"
              class="px-3 py-1 bg-gold-700 hover:bg-gold-600 text-white rounded text-xs">领取</button>
            <span v-else-if="t.claimed" class="text-xs text-jade-400">✓ 已领取</span>
          </div>
        </div>

        <!-- Members -->
        <div class="bg-ink-900/70 border border-ink-700 rounded-lg p-4">
          <h3 class="text-sm text-ink-400 uppercase tracking-wider mb-3">成员 ({{ members.length }})</h3>
          <div v-for="m in members" :key="m.id" class="flex items-center justify-between bg-ink-800/50 rounded p-3 mb-1">
            <div class="flex items-center gap-2">
              <span class="text-ink-200 text-sm">{{ m.nickname }}</span>
              <span class="text-xs px-1.5 py-0.5 rounded"
                :class="m.role === 'leader' ? 'text-gold-400 bg-gold-900/30' : m.role === 'admin' ? 'text-jade-400 bg-jade-900/30' : 'text-ink-400 bg-ink-800'">
                {{ m.role === 'leader' ? '宗主' : m.role === 'admin' ? '管理' : '成员' }}
              </span>
            </div>
            <button v-if="myRole === 'leader' && m.role !== 'leader'" @click="kickMember(m.id)"
              class="text-blood-400 hover:text-blood-300 text-xs">踢出</button>
          </div>
        </div>

        <div class="flex gap-3">
          <button v-if="myRole === 'leader'" @click="showTransfer = true"
            class="flex-1 py-2 bg-ink-700 hover:bg-ink-600 text-ink-200 rounded text-sm transition-colors">转让宗主</button>
          <button v-if="myRole !== 'leader'" @click="handleLeave"
            class="flex-1 py-2 bg-ink-700 hover:bg-ink-600 text-ink-200 rounded text-sm transition-colors">退出宗门</button>
        </div>
      </template>

      <div v-if="message" class="text-center text-sm" :class="msgType === 'ok' ? 'text-jade-400' : 'text-blood-400'">{{ message }}</div>
    </div>
  </div>
</template>

<script setup>
import { auth } from '~/composables/useAuth'
const router = useRouter()

const myClan = ref(null)
const myRole = ref('')
const members = ref([])
const tasks = ref([])

const createName = ref('')
const createDesc = ref('')
const creating = ref(false)
const createError = ref('')

const searchQuery = ref('')
const searchResults = ref([])
const searchDone = ref(false)

const showTransfer = ref(false)
const message = ref('')
const msgType = ref('ok')

onMounted(async () => {
  if (!auth.isLoggedIn()) { router.push('/'); return }
  await fetchClan()
})

async function fetchClan() {
  try {
    const res = await $fetch('/api/clan/my', { headers: auth.getHeaders() })
    myClan.value = res.clan
    myRole.value = res.role
    members.value = res.members
  } catch { myClan.value = null; return }

  try {
    const res = await $fetch('/api/clan/tasks', { headers: auth.getHeaders() })
    tasks.value = res.tasks
  } catch { tasks.value = [] }
}

async function handleCreate() {
  createError.value = ''
  creating.value = true
  try {
    await $fetch('/api/clan/create', { method: 'POST', headers: auth.getHeaders(), body: { name: createName.value, description: createDesc.value } })
    await auth.fetchMe()
    await fetchClan()
  } catch (e) {
    createError.value = e.data?.message || e.message || '创建失败'
  } finally { creating.value = false }
}

async function handleSearch() {
  searchDone.value = true
  try {
    const res = await $fetch('/api/clan/search', { method: 'POST', headers: auth.getHeaders(), body: { query: searchQuery.value } })
    searchResults.value = res.clans
  } catch { searchResults.value = [] }
}

async function handleJoin(clanId) {
  try {
    await $fetch('/api/clan/join', { method: 'POST', headers: auth.getHeaders(), body: { clanId } })
    await fetchClan()
  } catch (e) {
    message.value = e.data?.message || e.message || '加入失败'
    msgType.value = 'err'
  }
}

async function handleLeave() {
  try {
    await $fetch('/api/clan/leave', { method: 'POST', headers: auth.getHeaders() })
    myClan.value = null
    await auth.fetchMe()
  } catch (e) {
    message.value = e.data?.message || e.message || '退出失败'
    msgType.value = 'err'
  }
}

async function kickMember(memberId) {
  try {
    await $fetch('/api/clan/kick', { method: 'POST', headers: auth.getHeaders(), body: { memberId } })
    await fetchClan()
  } catch (e) {
    message.value = e.data?.message || e.message || '踢出失败'
    msgType.value = 'err'
  }
}

async function claimTask(taskId) {
  try {
    await $fetch('/api/clan/task-claim', { method: 'POST', headers: auth.getHeaders(), body: { taskId } })
    await fetchClan()
    await auth.fetchMe()
  } catch (e) {
    message.value = e.data?.message || e.message || '领取失败'
    msgType.value = 'err'
  }
}
</script>
