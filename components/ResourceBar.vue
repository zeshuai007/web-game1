<template>
  <div class="bg-ink-800/50 border border-ink-700 rounded-lg p-4">
    <h3 class="text-xs text-ink-400 uppercase tracking-wider mb-2 flex items-center gap-1">
      <img v-if="icon" :src="icon" alt="" class="w-4 h-4 inline-block" />
      {{ label }}
    </h3>
    <div class="relative h-3 bg-ink-950 rounded-full overflow-hidden">
      <div class="absolute inset-0 rounded-full transition-all duration-500 ease-linear"
        :class="barClass"
        :style="{ width: percentage + '%' }">
      </div>
    </div>
    <div class="flex justify-between mt-1 text-sm">
      <span class="text-ink-200">{{ current }}</span>
      <span class="text-ink-400">{{ max }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  label: { type: String, required: true },
  icon: { type: String, default: '' },
  current: { type: [String, Number], default: '0' },
  max: { type: [String, Number], default: '100' },
  barClass: { type: String, default: 'bg-jade-600' },
})

const percentage = computed(() => {
  const c = parseFloat(String(props.current))
  const m = parseFloat(String(props.max))
  if (m <= 0) return 0
  return Math.min((c / m) * 100, 100)
})
</script>
