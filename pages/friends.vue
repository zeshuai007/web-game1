<template>
  <div class="min-h-screen flex flex-col bg-ink-950">
    <GameHeader />
    <div class="flex-1 max-w-4xl w-full mx-auto px-4 py-6 space-y-6">
      <h2 class="font-title text-2xl text-gold-400 text-center tracking-wider">好 友</h2>

      <!-- Search & Add -->
      <div class="bg-ink-900/70 border border-ink-700 rounded-lg p-4">
        <h3 class="text-sm text-ink-400 uppercase tracking-wider mb-3">添加好友</h3>
        <div class="flex gap-2">
          <input v-model="searchQuery" @keyup.enter="searchPlayers" placeholder="搜索道号..." maxlength="20"
            class="flex-1 px-4 py-2 bg-ink-950 border border-ink-600 rounded focus:border-jade-500 focus:outline-none text-ink-100 placeholder-ink-500 text-sm" />
          <button @click="searchPlayers" :disabled="!searchQuery.trim()"
            class="px-4 py-2 bg-jade-700 hover:bg-jade-600 disabled:bg-ink-700 disabled:text-ink-500 text-white rounded text-sm transition-colors">
            搜索
          </button>
        </div>
        <div v-if="searchResults.length > 0" class="mt-3 space-y-2">
          <div v-for="r in searchResults" :key="r.id" class="flex items-center justify-between bg-ink-800/50 rounded p-2">
            <span class="text-ink-200 text-sm">{{ r.nickname }} · {{ r.realm }}</span>
            <button @click="sendRequest(r.id)" :disabled="r.sending"
              class="px-3 py-1 bg-gold-700 hover:bg-gold-600 disabled:bg-ink-700 disabled:text-ink-500 text-white rounded text-xs transition-colors">
              {{ r.sending ? '发送中...' : '加好友' }}
            </button>
          </div>
        </div>
        <p v-if="searchDone && searchResults.length === 0" class="text-ink-500 text-sm mt-2 text-center">未找到匹配的道号</p>
      </div>

      <!-- Incoming Requests -->
      <div v-if="incomingRequests.length > 0" class="bg-ink-900/70 border border-gold-600/30 rounded-lg p-4">
        <h3 class="text-sm text-gold-400 uppercase tracking-wider mb-3">好友请求 ({{ incomingRequests.length }})</h3>
        <div v-for="req in incomingRequests" :key="req.id" class="flex items-center justify-between bg-ink-800/50 rounded p-2 mb-2">
          <span class="text-ink-200 text-sm">{{ req.nickname }}</span>
          <div class="flex gap-2">
            <button @click="respondRequest(req.id, 'accept')" class="px-3 py-1 bg-jade-700 hover:bg-jade-600 text-white rounded text-xs">接受</button>
            <button @click="respondRequest(req.id, 'reject')" class="px-3 py-1 bg-ink-700 hover:bg-blood-600 text-ink-200 rounded text-xs">拒绝</button>
          </div>
        </div>
      </div>

      <!-- Friend List -->
      <div class="bg-ink-900/70 border border-ink-700 rounded-lg p-4">
        <h3 class="text-sm text-ink-400 uppercase tracking-wider mb-3">好友列表 ({{ friends.length }})</h3>
        <div v-if="friends.length === 0" class="text-ink-500 text-sm text-center py-4">暂无好友</div>
        <div v-for="f in friends" :key="f.id" class="flex items-center justify-between bg-ink-800/50 rounded p-3 mb-2">
          <div>
            <span class="text-ink-200 font-bold">{{ f.nickname }}</span>
            <span class="text-ink-400 text-sm ml-2">{{ f.realmLabel }} · {{ f.realmLayer }}</span>
          </div>
          <div class="flex gap-2">
            <button @click="handleDao(f)" :disabled="f.daoDone"
              class="px-3 py-1 rounded text-xs transition-colors"
              :class="f.daoDone ? 'bg-ink-700 text-ink-500' : 'bg-jade-700 hover:bg-jade-600 text-white'">
              {{ f.daoDone ? '已论道' : '论道' }}
            </button>
            <button @click="removeFriend(f.id)" class="px-3 py-1 bg-ink-700 hover:bg-blood-600 text-ink-200 rounded text-xs">删除</button>
          </div>
        </div>
      </div>

      <div v-if="message" class="text-center text-sm py-2 rounded" :class="msgType === 'ok' ? 'text-jade-400' : 'text-blood-400'">{{ message }}</div>
    </div>
  </div>
</template>

<script setup>
import { auth } from '~/composables/useAuth'
const router = useRouter()

const searchQuery = ref('')
const searchResults = ref([])
const searchDone = ref(false)
const friends = ref([])
const incomingRequests = ref([])
const message = ref('')
const msgType = ref('ok')

onMounted(async () => {
  if (!auth.isLoggedIn()) { router.push('/'); return }
  await loadFriends()
})

async function loadFriends() {
  try {
    const [listRes, pendingRes] = await Promise.all([
      $fetch('/api/friends/list', { headers: auth.getHeaders() }),
      $fetch('/api/friends/pending', { headers: auth.getHeaders() }),
    ])
    friends.value = listRes.friends.map((f) => ({ ...f, daoDone: false }))

    // Get realm labels from config
    const config = await $fetch('/api/config/game').catch(() => null)
    const realmMap = {}
    if (config?.realms) for (const r of config.realms) realmMap[r.key] = r.label

    for (const f of friends.value) {
      f.realmLabel = realmMap[f.realm] || f.realm
      // Check if already dao'd today
      try {
        const daoStatus = await $fetch(`/api/dao/status?targetId=${f.friendId}`, { headers: auth.getHeaders() })
        f.daoDone = daoStatus.doneToday
      } catch { /* ignore */ }
    }

    // incoming requests with sender info
    incomingRequests.value = pendingRes.requests || []
    for (const req of incomingRequests.value) {
      try {
        const charRes = await $fetch(`/api/characters/${req.fromCharacterId}`, { headers: auth.getHeaders() })
        req.nickname = charRes.nickname
      } catch { req.nickname = '未知' }
    }
  } catch { /* ignore */ }
}

async function searchPlayers() {
  message.value = ''
  searchDone.value = true
  try {
    const res = await $fetch(`/api/friends/search?q=${encodeURIComponent(searchQuery.value)}`, { headers: auth.getHeaders() })
    searchResults.value = (res.results || []).map((r) => ({ ...r, sending: false }))
  } catch { searchResults.value = [] }
}

async function sendRequest(charId) {
  const r = searchResults.value.find((s) => s.id === charId)
  if (!r) return
  r.sending = true
  try {
    await $fetch('/api/friends/request', { method: 'POST', headers: auth.getHeaders(), body: { toCharacterId: charId } })
    message.value = '好友请求已发送'
    msgType.value = 'ok'
  } catch (e) {
    message.value = e.data?.message || e.message || '发送失败'
    msgType.value = 'err'
  } finally { r.sending = false }
}

async function respondRequest(reqId, action) {
  try {
    await $fetch('/api/friends/respond', { method: 'POST', headers: auth.getHeaders(), body: { requestId: reqId, action } })
    await loadFriends()
  } catch (e) {
    message.value = e.data?.message || e.message || '操作失败'
    msgType.value = 'err'
  }
}

async function handleDao(f) {
  try {
    const res = await $fetch('/api/dao/start', { method: 'POST', headers: auth.getHeaders(), body: { targetCharacterId: f.friendId } })
    f.daoDone = true
    message.value = res.message
    msgType.value = 'ok'
  } catch (e) {
    message.value = e.data?.message || e.message || '论道失败'
    msgType.value = 'err'
  }
}

async function removeFriend(friendId) {
  try {
    const id = friends.value.find((f) => f.friendId === friendId)?.id
    if (!id) return
    await $fetch(`/api/friends/${id}`, { method: 'DELETE', headers: auth.getHeaders() })
    await loadFriends()
  } catch (e) {
    message.value = e.data?.message || e.message || '删除失败'
    msgType.value = 'err'
  }
}
</script>
