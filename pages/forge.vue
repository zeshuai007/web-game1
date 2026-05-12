<template>
  <div class="min-h-screen flex flex-col bg-ink-950">
    <div class="fixed inset-0 bg-alchemy-bg bg-cover bg-center opacity-30 -z-10"></div>
    <div class="fixed inset-0 bg-ink-950/70 -z-10"></div>
    <GameHeader />

    <div class="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
      <h2 class="font-title text-2xl text-gold-400 mb-6 text-center tracking-wider">炼 器</h2>

      <!-- Recipe List -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div v-for="recipe in recipes" :key="recipe.id" class="bg-ink-900/70 border border-ink-700 rounded-lg p-4 hover:border-jade-600/50 transition-colors">
          <h3 class="font-bold text-gold-300 mb-1">{{ recipe.name }}</h3>
          <p class="text-xs text-ink-400 mb-2">栏位：{{ slotNames[recipe.slot] || recipe.slot }}</p>
          <div class="space-y-1 mb-3 text-sm">
            <div v-for="m in recipe.materials" :key="m.id" class="flex justify-between text-ink-400">
              <span>{{ materialLabel(m.id) }}</span>
              <span :class="hasMaterial(m.id, m.qty) ? 'text-ink-200' : 'text-blood-400'">{{ getMaterialQty(m.id) }}/{{ m.qty }}</span>
            </div>
            <div class="flex justify-between text-ink-400 pt-1 border-t border-ink-700">
              <span>灵石消耗</span>
              <span :class="hasLingshi(recipe.cost) ? 'text-gold-400' : 'text-blood-400'">{{ recipe.cost }}</span>
            </div>
          </div>
          <button @click="craft(recipe)" :disabled="crafting"
            class="w-full py-2 bg-gold-800 hover:bg-gold-700 disabled:bg-ink-800 disabled:text-ink-500 text-white rounded text-sm transition-colors">
            {{ crafting === recipe.id ? '锻造中...' : '锻造' }}
          </button>
        </div>
      </div>

      <!-- Equipment Inventory -->
      <div class="bg-ink-900/70 border border-ink-700 rounded-lg p-4">
        <h3 class="text-sm text-ink-400 uppercase tracking-wider mb-3">装备背包</h3>
        <div v-if="equipList.length === 0" class="text-ink-500 text-sm text-center py-4">暂无装备</div>
        <div v-for="eqp in equipList" :key="eqp.id" class="flex items-center justify-between bg-ink-800/50 rounded p-3 mb-2">
          <div>
            <span class="text-sm font-bold" :class="eqp.qualityColor || 'text-ink-200'">{{ eqp.name }}</span>
            <span class="text-xs text-ink-400 ml-2">{{ slotNames[eqp.slot] || eqp.slot }}</span>
            <div class="text-xs text-ink-500 mt-0.5">
              <span v-if="parseFloat(eqp.bonusLingqiRate) > 0">灵气+{{ (parseFloat(eqp.bonusLingqiRate)*100).toFixed(0) }}% </span>
              <span v-if="parseFloat(eqp.bonusLingshiRate) > 0">灵石+{{ (parseFloat(eqp.bonusLingshiRate)*100).toFixed(0) }}%</span>
            </div>
          </div>
          <button @click="toggleEquip(eqp)" class="px-3 py-1 rounded text-xs transition-colors"
            :class="eqp.equipped ? 'bg-jade-800 text-jade-200' : 'bg-ink-700 hover:bg-jade-700 text-ink-200'">
            {{ eqp.equipped ? '已装备' : '装备' }}
          </button>
        </div>
      </div>

      <div v-if="message" class="mt-4 text-center text-sm py-2 rounded" :class="msgType === 'ok' ? 'text-jade-400' : 'text-blood-400'">{{ message }}</div>
    </div>
  </div>
</template>

<script setup>
import { auth } from '~/composables/useAuth'
const router = useRouter()

const recipes = ref([])
const equipList = ref([])
const crafting = ref('')
const message = ref('')
const msgType = ref('ok')

const slotNames = { weapon: '武器', armor: '护甲', accessory: '饰品', artifact: '法宝' }
const materialLabels = { youhun_cao: '幽魂草', ningxue_hua: '凝血花', hansui_ye: '寒髓叶', longxian_guo: '龙涎果', wannian_lingzhi: '万年灵芝', qicai_xuelian: '七彩雪莲' }
function materialLabel(id) { return materialLabels[id] || id }

onMounted(async () => {
  if (!auth.isLoggedIn()) { router.push('/'); return }
  await load()
})

async function load() {
  try {
    const [craftRes, invRes] = await Promise.all([
      $fetch('/api/alchemy/list', { headers: auth.getHeaders() }),
      $fetch('/api/forge/inventory', { headers: auth.getHeaders() }),
    ])

    recipes.value = [
      { id: 'wooden_sword', name: '木剑', slot: 'weapon', materials: [{ id: 'youhun_cao', qty: 3 }], cost: 50 },
      { id: 'bronze_armor', name: '青铜甲', slot: 'armor', materials: [{ id: 'ningxue_hua', qty: 3 }], cost: 80 },
      { id: 'jade_pendant', name: '玉佩', slot: 'accessory', materials: [{ id: 'hansui_ye', qty: 3 }], cost: 100 },
      { id: 'spirit_circlet', name: '灵环', slot: 'artifact', materials: [{ id: 'longxian_guo', qty: 2 }, { id: 'wannian_lingzhi', qty: 1 }], cost: 500 },
    ]
    equipList.value = invRes.items
  } catch { /* ignore */ }
}

async function loadInventory() {
  try {
    const invRes = await $fetch('/api/forge/inventory', { headers: auth.getHeaders() })
    equipList.value = invRes.items
  } catch { /* ignore */ }
}

function getMaterialQty(materialId) {
  return 0 // We'll use the inventory from the load
}

function hasMaterial(materialId, qty) {
  return true // Simplified check
}

function hasLingshi(cost) {
  return auth.character?.value && parseFloat(auth.character.value.lingshi) >= cost
}

async function craft(recipe) {
  crafting.value = recipe.id
  message.value = ''
  try {
    const res = await $fetch('/api/forge/craft', {
      method: 'POST', headers: auth.getHeaders(), body: { recipeId: recipe.id },
    })
    message.value = res.message
    msgType.value = 'ok'
    await auth.fetchMe()
    await loadInventory()
  } catch (e) {
    message.value = e.data?.message || e.message || '锻造失败'
    msgType.value = 'err'
  } finally { crafting.value = '' }
}

async function toggleEquip(eqp) {
  try {
    await $fetch('/api/forge/equip', {
      method: 'POST', headers: auth.getHeaders(),
      body: { equipmentId: eqp.id, unequip: !!eqp.equipped },
    })
    await loadInventory()
  } catch (e) {
    message.value = e.data?.message || e.message || '操作失败'
    msgType.value = 'err'
  }
}
</script>
