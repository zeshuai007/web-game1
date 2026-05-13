<template>
  <div>
    <ClientOnly>
      <NuxtPage />
      <div class="fixed bottom-0 right-4 z-50 flex items-end gap-3 pointer-events-none">
        <div class="pointer-events-auto" v-for="window in privateWindows" :key="window.peerId">
          <PrivateChatWindow :window="window" />
        </div>
      </div>
      <template #fallback>
        <div class="min-h-screen flex items-center justify-center bg-ink-950">
          <p class="text-ink-400 animate-pulse font-title text-2xl">仙 逆</p>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup>
import { auth } from '~/composables/useAuth'
import { useChat } from '~/composables/useChat'

const chat = useChat()
const privateWindows = computed(() => chat.privateWindows.value.filter(window => !!window && !!window.peerId))

useHead({
  title: '仙逆 - 放置修仙',
  link: [
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=ZCOOL+QingKe+HuangYou&family=Noto+Serif+SC:wght@400;700&family=JetBrains+Mono&display=swap' },
  ],
  bodyAttrs: {
    class: 'bg-ink-950 text-ink-100 font-body min-h-screen',
  },
})

onMounted(async () => {
  if (auth.isLoggedIn()) {
    if (!auth.character.value) {
      await auth.fetchMe()
    }
    await chat.connect()
  }
})

watch(() => auth.character.value?.id, async (characterId) => {
  if (characterId) {
    await chat.connect()
  } else {
    await chat.disconnect()
  }
})
</script>
