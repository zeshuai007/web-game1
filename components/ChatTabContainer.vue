<template>
  <div class="bg-ink-900/70 border border-ink-700 rounded-lg p-4 h-full flex flex-col">
    <div class="flex items-center justify-between gap-3 mb-4">
      <div class="flex items-center gap-2">
        <button
          class="px-3 py-1.5 rounded text-sm transition-colors"
          :class="activeTab === 'world' ? 'bg-jade-700 text-white' : 'bg-ink-800 text-ink-300 hover:text-ink-100'"
          @click="showWorld"
        >
          世界频道
        </button>
        <button
          class="px-3 py-1.5 rounded text-sm transition-colors relative"
          :class="activeTab === 'private' ? 'bg-gold-700 text-white' : 'bg-ink-800 text-ink-300 hover:text-ink-100'"
          @click="showPrivate"
        >
          私聊
          <span v-if="totalUnread > 0" class="absolute -top-1 -right-1 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-blood-600 text-white text-[11px] px-1">
            {{ totalUnread }}
          </span>
        </button>
      </div>
      <p class="text-xs text-ink-500">世界不存档，私聊会保留</p>
    </div>

    <div class="flex-1 min-h-0">
      <WorldChat v-if="activeTab === 'world'" />

      <div v-else class="h-full flex flex-col gap-3">
        <div v-if="unreadConversations.length === 0" class="flex-1 flex items-center justify-center text-sm text-ink-500 border border-dashed border-ink-700 rounded-lg">
          尚无未读私聊，点击世界频道道号可发起私聊。
        </div>
        <div v-else class="space-y-2 overflow-y-auto max-h-[420px] pr-1">
          <button
            v-for="conversation in unreadConversations"
            :key="conversation.characterId"
            class="w-full flex items-center justify-between rounded-lg border border-ink-800 bg-ink-950/60 px-3 py-2 text-left hover:border-gold-700/40 transition-colors"
            @click="chat.openPrivateChat(conversation.characterId, conversation.nickname)"
          >
            <span>
              <span class="block text-sm text-gold-300">{{ conversation.nickname }}</span>
              <span class="block text-xs text-ink-500">有新的江湖密信</span>
            </span>
            <span class="inline-flex min-w-6 h-6 items-center justify-center rounded-full bg-blood-600 text-white text-xs px-1.5">
              {{ conversation.unreadCount }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChat } from '~/composables/useChat'

const chat = useChat()
const activeTab = computed(() => chat.activeTab.value)
const totalUnread = computed(() => chat.totalUnread.value)
const unreadConversations = computed(() => chat.unreadConversations.value.filter(conversation => !!conversation && !!conversation.characterId))

function showWorld() {
  chat.activeTab.value = 'world'
}

function showPrivate() {
  chat.activeTab.value = 'private'
}
</script>
