<template>
  <div class="animate-pulse rounded" :class="[height, width, 'bg-ink-800']" :style="extraStyle"></div>
</template>

<script setup>
defineProps({
  height: { type: String, default: 'h-4' },
  width: { type: String, default: 'w-full' },
  extraStyle: { type: String, default: '' },
})
</script>
