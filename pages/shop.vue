<template>
  <div class="min-h-screen flex flex-col bg-shop-bg bg-cover bg-center">
    <div class="fixed inset-0 bg-ink-950/70 -z-10"></div>
    <GameHeader />

    <div class="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
      <div class="text-center mb-6">
        <h2 class="font-title text-2xl text-gold-400 tracking-wider">坊 市</h2>
        <p class="text-ink-400 text-sm mt-1">当前灵石：<span class="text-gold-400 font-bold">{{ formatLingshi }}</span></p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div v-for="item in items" :key="item.id"
          class="bg-ink-900/70 border border-ink-700 rounded-lg p-5 text-center hover:border-jade-600/50 transition-colors">
          <h3 class="font-bold text-gold-300 mb-1">{{ item.name }}</h3>
          <p class="text-xs text-ink-400 mb-3">{{ item.description }}</p>
          <p class="text-sm text-gold-400 mb-3">单价：{{ item.price }} 灵石</p>

          <div class="flex gap-2">
            <button @click="buy(item.id, 1)" :disabled="!canAfford(item.price)"
              class="flex-1 py-2 bg-jade-800 hover:bg-jade-700 disabled:bg-ink-800 disabled:text-ink-500 text-white rounded text-sm transition-colors">
              买 ×1
            </button>
            <button @click="buy(item.id, 10)" :disabled="!canAfford(item.price * 10)"
              class="flex-1 py-2 bg-jade-800 hover:bg-jade-700 disabled:bg-ink-800 disabled:text-ink-500 text-white rounded text-sm transition-colors">
              买 ×10
            </button>
          </div>
        </div>
      </div>

      <div v-if="message" class="mt-6 text-center text-sm py-3 rounded-lg"
        :class="messageType === 'success' ? 'bg-jade-900/30 text-jade-300 border border-jade-700/30' : 'bg-blood-900/30 text-blood-300 border border-blood-700/30'">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { auth } from '~/composables/useAuth'

const router = useRouter()
const items = ref([])
const message = ref('')
const messageType = ref('success')

onMounted(async () => {
  if (!auth.isLoggedIn()) { router.push('/'); return }
  await auth.fetchMe() // 刷新最新灵石余额（离开修炼页期间挂机产出仍在累积）
  const res = await $fetch('/api/shop/items', { headers: auth.getHeaders() })
  items.value = res.items
})

function canAfford(price) {
  return auth.character?.value && parseFloat(auth.character.value.lingshi) >= price
}

const formatLingshi = computed(() => {
  if (!auth.character?.value) return '0'
  const n = parseFloat(auth.character.value.lingshi)
  if (n >= 1e8) return (n / 1e8).toFixed(2) + '亿'
  if (n >= 1e4) return (n / 1e4).toFixed(2) + '万'
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 0 })
})

async function buy(itemId, quantity) {
  message.value = ''
  try {
    const res = await $fetch('/api/shop/buy', {
      method: 'POST',
      headers: auth.getHeaders(),
      body: { itemId, quantity },
    })
    message.value = res.message
    messageType.value = 'success'
    await auth.fetchMe()
  } catch (e) {
    message.value = e.data?.message || e.message || '购买失败'
    messageType.value = 'error'
  }
}
</script>
