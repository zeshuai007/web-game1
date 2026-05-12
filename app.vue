<template>
  <div>
    <ClientOnly>
      <NuxtPage />
      <template #fallback>
        <div class="min-h-screen flex items-center justify-center bg-ink-950">
          <p class="text-ink-400 animate-pulse font-title text-2xl">仙 逆</p>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup>
useHead({
  title: '仙逆 - 放置修仙',
  link: [
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=ZCOOL+QingKe+HuangYou&family=Noto+Serif+SC:wght@400;700&family=JetBrains+Mono&display=swap' },
  ],
  bodyAttrs: {
    class: 'bg-ink-950 text-ink-100 font-body min-h-screen',
  },
})
</script>
