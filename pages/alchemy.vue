<template>
  <div class="min-h-screen flex flex-col bg-alchemy-bg bg-cover bg-center">
    <div class="fixed inset-0 bg-ink-950/70 -z-10"></div>
    <GameHeader />

    <div class="flex-1 max-w-6xl w-full mx-auto px-4 py-6 relative">
      <!-- Cauldron decoration -->
      <div class="absolute top-4 right-4 w-24 h-24 opacity-20 pointer-events-none z-0">
        <img src="/images/decorations/cauldron.png" alt="" class="w-full h-full object-contain" />
      </div>

      <h2 class="font-title text-2xl text-gold-400 mb-6 text-center tracking-wider">丹 房</h2>

      <!-- Filter tabs -->
      <div class="flex justify-center gap-2 mb-6">
        <button @click="filter = 'all'" class="px-4 py-1.5 rounded text-sm transition-colors"
          :class="filter === 'all' ? 'bg-jade-700 text-white' : 'bg-ink-800 text-ink-300 hover:bg-ink-700'">全部</button>
        <button @click="filter = 'cultivation'" class="px-4 py-1.5 rounded text-sm transition-colors"
          :class="filter === 'cultivation' ? 'bg-jade-700 text-white' : 'bg-ink-800 text-ink-300 hover:bg-ink-700'">修炼丹</button>
        <button @click="filter = 'breakthrough'" class="px-4 py-1.5 rounded text-sm transition-colors"
          :class="filter === 'breakthrough' ? 'bg-gold-700 text-white' : 'bg-ink-800 text-ink-300 hover:bg-ink-700'">破境丹</button>
      </div>

      <!-- Skeleton during load -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="n in 6" :key="n" class="bg-ink-900/70 border border-ink-700 rounded-lg p-5 space-y-3">
          <SkeletonBlock height="h-5" width="w-1/3" />
          <SkeletonBlock height="h-3" width="w-1/2" />
          <SkeletonBlock height="h-3" />
          <SkeletonBlock height="h-3" width="w-2/3" />
          <SkeletonBlock height="h-8" />
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="recipe in filteredRecipes" :key="recipe.id"
          class="bg-ink-900/70 border border-ink-700 rounded-lg p-5 hover:border-jade-600/50 transition-colors">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2">
              <img src="/images/decorations/pill-glow.png" alt="" class="w-6 h-6 opacity-60" />
              <div>
                <h3 class="font-bold text-gold-300">{{ recipe.name }}</h3>
                <span class="text-xs text-ink-400">{{ recipe.realm }}</span>
              </div>
            </div>
            <span class="text-xs px-2 py-0.5 rounded"
              :class="recipe.type === 'cultivation' ? 'bg-jade-900/50 text-jade-300' : 'bg-gold-900/50 text-gold-300'">
              {{ recipe.type === 'cultivation' ? '修炼丹' : '破境丹' }}
            </span>
          </div>

          <p class="text-sm text-ink-300 mb-2">{{ recipe.effect }}</p>

          <div class="space-y-1 mb-4">
            <div v-for="mat in recipe.materials" :key="mat.id"
              class="flex justify-between text-sm">
              <span class="text-ink-400">{{ mat.name }}</span>
              <span :class="hasEnough(mat.id, mat.quantity) ? 'text-ink-200' : 'text-blood-400'">
                {{ getMaterialQty(mat.id) }} / {{ mat.quantity }}
              </span>
            </div>
            <div class="flex justify-between text-sm pt-1 border-t border-ink-700">
              <span class="text-ink-400">灵石消耗</span>
              <span :class="hasEnoughLingshi(recipe.cost) ? 'text-gold-400' : 'text-blood-400'">
                {{ recipe.cost }}
              </span>
            </div>
          </div>

          <button @click="refine(recipe.id)" :disabled="!canRefine(recipe)"
            class="w-full py-2 bg-jade-800 hover:bg-jade-700 disabled:bg-ink-800 disabled:text-ink-500 text-white rounded text-sm transition-colors">
            炼 制
          </button>
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
const route = useRoute()
const recipes = ref([])
const inventory = ref([])
const message = ref('')
const messageType = ref('success')
const filter = ref((route.query.filter) || 'all')
const loading = ref(true)

const filteredRecipes = computed(() => {
  if (filter.value === 'all') return recipes.value
  return recipes.value.filter(r => r.type === filter.value)
})

onMounted(async () => {
  if (!auth.isLoggedIn()) { router.push('/'); return }
  await Promise.all([fetchRecipes(), fetchInventory()])
  loading.value = false
})

async function fetchRecipes() {
  const res = await $fetch('/api/alchemy/list', { headers: auth.getHeaders() })
  recipes.value = res.recipes
}

async function fetchInventory() {
  const res = await $fetch('/api/inventory', { headers: auth.getHeaders() })
  inventory.value = res.items
}

function getMaterialQty(materialId) {
  const item = inventory.value.find(i => i.itemId === materialId)
  return item ? item.quantity : 0
}

function hasEnough(materialId, qty) {
  return getMaterialQty(materialId) >= qty
}

function hasEnoughLingshi(cost) {
  return auth.character?.value && parseFloat(auth.character.value.lingshi) >= cost
}

function canRefine(recipe) {
  if (!auth.character?.value) return false
  if (!hasEnoughLingshi(recipe.cost)) return false
  return recipe.materials.every(m => hasEnough(m.id, m.quantity))
}

async function refine(pillType) {
  message.value = ''
  try {
    const res = await $fetch('/api/alchemy/refine', {
      method: 'POST',
      headers: auth.getHeaders(),
      body: { pillType },
    })
    message.value = '炼丹成功！'
    messageType.value = 'success'
    await Promise.all([fetchInventory(), auth.fetchMe()])
  } catch (e) {
    message.value = e.data?.message || e.message || '炼丹失败'
    messageType.value = 'error'
  }
}
</script>
