<template>
  <div class="w-80 bg-ink-900/95 border border-ink-700 rounded-t-lg shadow-2xl overflow-hidden">
    <div class="flex items-center justify-between px-3 py-2 bg-ink-950/70 border-b border-ink-700">
      <button class="flex items-center gap-2 min-w-0" @click="chat.togglePrivateChat(window.peerId)">
        <span class="truncate text-sm text-gold-300">{{ window.nickname }}</span>
        <span v-if="window.unread > 0" class="inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-blood-600 text-white text-[11px] px-1">
          {{ window.unread }}
        </span>
      </button>
      <div class="flex items-center gap-2 text-xs">
        <button class="text-ink-400 hover:text-ink-200" @click="chat.togglePrivateChat(window.peerId)">{{ window.minimized ? '展开' : '最小化' }}</button>
        <button class="text-ink-400 hover:text-blood-400" @click="chat.closePrivateChat(window.peerId)">关闭</button>
      </div>
    </div>

    <div v-if="!window.minimized" class="flex flex-col h-96">
      <div ref="scroller" class="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-ink-950/60">
        <button
          v-if="window.hasMore"
          class="w-full text-xs text-ink-400 hover:text-ink-200"
          :disabled="window.loading"
          @click="chat.loadPrivateHistory(window.peerId, window.nickname, window.nextCursor)"
        >
          {{ window.loading ? '加载中...' : '加载更早消息' }}
        </button>

        <div v-for="(message, index) in window.messages" :key="message.id || `${message.timestamp}-${index}`"
          class="rounded-lg px-3 py-2 text-sm border"
          :class="message.from?.id === auth.character.value?.id ? 'bg-jade-950/50 border-jade-700/30 text-jade-100 ml-6' : 'bg-ink-900 border-ink-800 text-ink-100 mr-6'">
          <div class="text-[11px] text-ink-500 mb-1">{{ message.from?.nickname || '未知道友' }}</div>
          <div>{{ message.content }}</div>
        </div>
      </div>

      <form class="border-t border-ink-700 p-3 flex gap-2" @submit.prevent="handleSend">
        <input
          v-model="draft"
          type="text"
          maxlength="200"
          :disabled="sending || (chat.isRealtimeEnabled && chat.connectionState !== 'connected')"
          placeholder="输入私聊内容..."
          class="flex-1 px-3 py-2 bg-ink-900 border border-ink-700 rounded text-sm text-ink-100 placeholder-ink-500 focus:outline-none focus:border-jade-600 disabled:bg-ink-950 disabled:text-ink-500"
        />
        <button
          type="submit"
          :disabled="sending || !draft.trim()"
          class="px-4 py-2 rounded bg-gold-700 hover:bg-gold-600 disabled:bg-ink-800 disabled:text-ink-500 text-white text-sm transition-colors"
        >
          {{ sending ? '发送中...' : '发送' }}
        </button>
      </form>
      <p v-if="errorMessage" class="px-3 pb-3 text-xs text-blood-400">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { auth } from '~/composables/useAuth'
import { useChat } from '~/composables/useChat'

const props = defineProps<{
  window: {
    peerId: string
    nickname: string
    messages: Array<{ id?: string; timestamp: number; content: string; from?: { id: string; nickname: string } }>
    nextCursor: string | null
    hasMore: boolean
    loading: boolean
    minimized: boolean
    unread: number
  }
}>()

const chat = useChat()
const draft = ref('')
const sending = ref(false)
const errorMessage = ref('')
const scroller = ref<HTMLElement | null>(null)

async function handleSend() {
  if (!draft.value.trim() || sending.value) return
  sending.value = true
  errorMessage.value = ''
  try {
    await chat.sendPrivateMessage(props.window.peerId, props.window.nickname, draft.value)
    draft.value = ''
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || '发送失败'
  } finally {
    sending.value = false
  }
}

watch(() => props.window.messages.length, async () => {
  await nextTick()
  if (scroller.value) {
    scroller.value.scrollTop = scroller.value.scrollHeight
  }
})
</script>
