<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="relative rounded-lg w-full max-w-md p-8 mx-4 shadow-2xl overflow-hidden" style="box-shadow: 0 0 40px rgba(245, 180, 10, 0.15);">
      <div class="absolute inset-0 bg-tribulation-bg bg-cover bg-center opacity-40"></div>
      <div class="absolute inset-0 bg-ink-900/80"></div>
      <div class="relative z-10">
        <h2 class="font-title text-2xl text-center text-gold-400 mb-6">境界突破</h2>

        <div class="text-center mb-6">
          <p class="text-ink-200 text-lg mb-2">{{ currentRealmLabel }} → {{ nextRealmLabel }}</p>
          <p class="text-ink-400 text-sm">灵气已圆满，可尝试突破</p>
        </div>

        <div class="bg-ink-800/50 border border-ink-700 rounded-lg p-4 mb-6">
          <div class="flex justify-between items-center">
            <span class="text-ink-300">基础突破概率</span>
            <span class="text-gold-400 font-bold">{{ (baseChance * 100).toFixed(0) }}%</span>
          </div>
          <div v-if="hasPillInInventory" class="flex justify-between items-center mt-2">
            <span class="text-ink-300">使用破境丹</span>
            <span class="text-jade-400 text-sm">+20% → {{ Math.min(baseChance + 0.2, 0.9) * 100 }}%</span>
          </div>
        </div>

        <div v-if="!hasPillInInventory && !result" class="text-center mb-3">
          <button @click="$emit('goAlchemy')" class="text-jade-400 hover:text-jade-300 text-xs underline transition-colors">
            缺少破境丹？前去炼制 →
          </button>
        </div>

        <div v-if="result" class="text-center mb-4">
          <p v-if="result.success" class="text-jade-400 text-lg">{{ result.message }}</p>
          <p v-else class="text-blood-400 text-lg">{{ result.message }}</p>
        </div>

        <div class="flex gap-3">
          <button v-if="!result" @click="$emit('attempt', true)" :disabled="!hasPillInInventory"
            class="flex-1 py-2.5 bg-gold-700 hover:bg-gold-600 disabled:bg-ink-700 disabled:text-ink-500 text-white rounded transition-colors">
            服用破境丹突破
          </button>
          <button v-if="!result" @click="$emit('attempt', false)"
            class="flex-1 py-2.5 bg-jade-700 hover:bg-jade-600 text-white rounded transition-colors">
            直接突破
          </button>
        </div>
        <button v-if="result" @click="$emit('close')"
          class="w-full mt-3 py-2.5 bg-ink-700 hover:bg-ink-600 text-ink-200 rounded transition-colors">
          返回
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  currentRealmLabel: String,
  nextRealmLabel: String,
  baseChance: { type: Number, default: 0.3 },
  hasPillInInventory: Boolean,
  result: Object,
})

defineEmits(['close', 'attempt', 'goAlchemy'])
</script>
