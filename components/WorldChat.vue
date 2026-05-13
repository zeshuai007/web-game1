<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between gap-3 mb-3">
      <div>
        <h3 class="text-sm text-ink-400 uppercase tracking-wider">世界频道</h3>
        <p class="text-xs text-ink-500 mt-1">当前在线 {{ onlineCount }} 人</p>
      </div>
      <span v-if="isRealtimeEnabled && connectionState !== 'connected'" class="text-xs px-2 py-1 rounded-full border border-gold-700/30 bg-gold-950/40 text-gold-300">
        连接中
      </span>
    </div>

    <div class="flex-1 min-h-0 rounded-lg bg-ink-950/60 border border-ink-800 overflow-hidden flex flex-col">
      <div ref="scroller" class="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        <div v-if="worldMessages.length === 0" class="text-center text-sm text-ink-500 py-10">
          江湖寂静，尚无人发言。
        </div>

        <div v-for="(message, index) in worldMessages" :key="message.id || `${message.timestamp}-${index}`"
          class="rounded-lg px-3 py-2 text-sm"
          :class="message.type === 'system' ? 'bg-gold-950/40 border border-gold-700/20 text-gold-200' : 'bg-ink-900/70 border border-ink-800 text-ink-200'">
          <template v-if="message.type === 'system'">
            {{ message.content }}
          </template>
          <template v-else>
            <div class="flex items-center gap-2 mb-1 text-xs">
              <button class="text-jade-300 hover:text-jade-200 transition-colors" @click="openPrivate(message)">
                {{ message.from?.nickname || '未知道友' }}
              </button>
              <span class="text-ink-500">{{ message.realm }}</span>
            </div>
            <div>{{ message.content }}</div>
          </template>
        </div>
      </div>

      <div v-if="isRealtimeEnabled && connectionState === 'disconnected'" class="px-4 py-2 text-xs text-gold-200 bg-gold-950/50 border-t border-gold-700/20">
        连接断开，正在重连...
      </div>

      <form class="border-t border-ink-800 p-3 flex gap-2" @submit.prevent="handleSend">
        <input
          v-model="draft"
          type="text"
          maxlength="200"
          :disabled="sending || !canSpeak || (isRealtimeEnabled && connectionState !== 'connected')"
          :placeholder="placeholder"
          class="flex-1 px-3 py-2 bg-ink-900 border border-ink-700 rounded text-sm text-ink-100 placeholder-ink-500 focus:outline-none focus:border-jade-600 disabled:bg-ink-950 disabled:text-ink-500"
        />
        <button
          type="submit"
          :disabled="sending || !canSpeak || !draft.trim()"
          class="px-4 py-2 rounded bg-jade-700 hover:bg-jade-600 disabled:bg-ink-800 disabled:text-ink-500 text-white text-sm transition-colors"
        >
          {{ sending ? '发送中...' : '发送' }}
        </button>
      </form>

      <p v-if="errorMessage" class="px-4 pb-3 text-xs text-blood-400">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { auth } from '~/composables/useAuth'
import { useChat } from '~/composables/useChat'

const chat = useChat()
const draft = ref('')
const sending = ref(false)
const errorMessage = ref('')
const scroller = ref<HTMLElement | null>(null)
const worldMessages = computed(() => chat.worldMessages.value.filter(message => !!message && !!message.type))
const onlineCount = computed(() => chat.onlineCount.value)
const connectionState = computed(() => chat.connectionState.value)
const isRealtimeEnabled = computed(() => chat.isRealtimeEnabled.value)

const canSpeak = computed(() => {
  const character = auth.character.value
  if (!character) return false
  return character.realm !== 'condensing_qi' || character.realmLayer >= 3
})

const placeholder = computed(() => {
  if (!auth.character.value) return '请先登录'
  if (!canSpeak.value) return '凝气期第3层以上方可发言'
  if (isRealtimeEnabled.value && connectionState.value !== 'connected') return '聊天连接中...'
  return '输入江湖传音...'
})

function openPrivate(message: { from?: { id: string; nickname: string } }) {
  if (!message.from?.id) return
  if (message.from.id === auth.character.value?.id) return
  chat.openPrivateChat(message.from.id, message.from.nickname)
}

async function handleSend() {
  if (!draft.value.trim() || sending.value || !canSpeak.value) return
  sending.value = true
  errorMessage.value = ''
  try {
    await chat.sendWorldMessage(draft.value)
    draft.value = ''
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || '发送失败'
  } finally {
    sending.value = false
  }
}

watch(() => chat.worldMessages.value.length, async () => {
  await nextTick()
  if (scroller.value) {
    scroller.value.scrollTop = scroller.value.scrollHeight
  }
})
</script>
