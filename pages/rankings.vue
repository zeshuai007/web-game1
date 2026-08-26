<template>
  <div class="min-h-screen flex flex-col bg-rankings-bg bg-cover bg-center">
    <div class="fixed inset-0 bg-ink-950/70 -z-10"></div>
    <GameHeader />

    <div class="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
      <h2 class="font-title text-2xl text-gold-400 mb-6 text-center tracking-wider">修 为 排 行</h2>

      <div class="bg-ink-900/70 border border-ink-700 rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-ink-700 text-ink-400 text-sm">
                <th class="py-3 px-4 text-left w-12">#</th>
                <th class="py-3 px-4 text-left">道号</th>
                <th class="py-3 px-4 text-left">境界</th>
                <th class="py-3 px-4 text-right">灵气修为</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in rankings" :key="r.rank"
                class="border-b border-ink-800 hover:bg-ink-800/50 transition-colors"
                :class="isMe(r) ? 'bg-jade-900/20' : ''">
                <td class="py-3 px-4">
                  <span v-if="r.rank === 1" class="text-gold-400 font-bold">🥇</span>
                  <span v-else-if="r.rank === 2" class="text-ink-300 font-bold">🥈</span>
                  <span v-else-if="r.rank === 3" class="text-gold-600 font-bold">🥉</span>
                  <span v-else class="text-ink-500">{{ r.rank }}</span>
                </td>
                <td class="py-3 px-4 text-ink-200">{{ r.nickname }}</td>
                <td class="py-3 px-4">
                  <span class="text-jade-400">{{ r.realm }}</span>
                  <span class="text-ink-400 text-sm"> · {{ r.realm === '凝气期' ? '第' + r.realmLayer + '层' : (['初期','中期','后期'][r.realmLayer - 1] || '') }}</span>
                </td>
                <td class="py-3 px-4 text-right text-ink-300">
                  {{ formatNumber(r.lingqi) }}
                </td>
              </tr>
              <tr v-if="rankings.length === 0">
                <td colspan="4" class="py-8 text-center text-ink-500">暂无数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 我的排名（PRD US16）：百名外玩家也能看到自己的进度 -->
      <div v-if="me" class="mt-4 bg-jade-950/40 border border-jade-700/40 rounded-lg px-4 py-3 flex items-center justify-between text-sm">
        <span class="text-jade-300 font-bold">我的排名</span>
        <span class="text-ink-200">
          <b class="text-gold-400">#{{ me.rank }}</b>
          <span class="text-ink-400 ml-3">{{ me.realm }} · 第{{ me.realmLayer }}{{ me.realm === '凝气期' ? '层' : (['初期','中期','后期'][me.realmLayer - 1] || '') }}</span>
          <span class="ml-3">修为 {{ formatNumber(me.lingqi) }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { auth } from '~/composables/useAuth'

const router = useRouter()
const rankings = ref([])

onMounted(async () => {
  if (!auth.isLoggedIn()) { router.push('/'); return }
  try {
    const res = await $fetch('/api/rankings', { headers: auth.getHeaders() })
    rankings.value = res.rankings
  } catch { /* ignore */ }
})

function isMe(r) {
  return auth.character?.value && r.nickname === auth.character.value.nickname
}

function formatNumber(n) {
  const num = parseFloat(n)
  if (num >= 1e8) return (num / 1e8).toFixed(2) + '亿'
  if (num >= 1e4) return (num / 1e4).toFixed(2) + '万'
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 0 })
}
</script>
