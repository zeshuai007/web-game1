import { computed } from 'vue'

import { auth } from './useAuth'

type ChatMessage = {
  id?: string
  type: 'chat' | 'system'
  from?: { id: string; nickname: string }
  content: string
  timestamp: number
  realm?: string
}

type PrivateConversationSummary = {
  characterId: string
  nickname: string
  unreadCount: number
}

type PrivateChatWindow = {
  peerId: string
  nickname: string
  messages: ChatMessage[]
  nextCursor: string | null
  hasMore: boolean
  loading: boolean
  minimized: boolean
  unread: number
}

let pusherPromise: Promise<any> | null = null
let pusherClient: any = null
let worldChannel: any = null
let privateChannel: any = null
let worldBound = false
let privateBound = false
let connectionBound = false

export function useChat() {
  const config = useRuntimeConfig()
  const worldMessages = useState<ChatMessage[]>('chat-world-messages', () => [])
  const privateWindows = useState<PrivateChatWindow[]>('chat-private-windows', () => [])
  const unreadConversations = useState<PrivateConversationSummary[]>('chat-unread-conversations', () => [])
  const activeTab = useState<'world' | 'private'>('chat-active-tab', () => 'world')
  const onlineCount = useState<number>('chat-online-count', () => 0)
  const connectionState = useState<'connected' | 'connecting' | 'disconnected'>('chat-connection-state', () => 'disconnected')

  const totalUnread = computed(() => unreadConversations.value.reduce((sum, conversation) => sum + conversation.unreadCount, 0))
  const isRealtimeEnabled = computed(() => process.client && !!config.public.pusherEnabled && !!config.public.pusherKey)

  async function ensurePusher() {
    if (!process.client || !isRealtimeEnabled.value || !auth.character.value) return null
    if (pusherClient) return pusherClient

    if (!pusherPromise) {
      pusherPromise = import('pusher-js').then((module) => {
        const Pusher = module.default
        const client = new Pusher(config.public.pusherKey, {
          cluster: config.public.pusherCluster,
          forceTLS: true,
          channelAuthorization: {
            endpoint: '/api/pusher/auth',
            transport: 'ajax',
            headersProvider: () => auth.getHeaders(),
          },
        })
        return client
      })
    }

    pusherClient = await pusherPromise
    return pusherClient
  }

  function appendWorldMessage(message: ChatMessage) {
    const next = [...worldMessages.value, message]
    worldMessages.value = next.slice(-200)
  }

  function upsertUnread(conversation: PrivateConversationSummary) {
    const existing = unreadConversations.value.find(item => item.characterId === conversation.characterId)
    if (existing) {
      existing.unreadCount = conversation.unreadCount
      existing.nickname = conversation.nickname
      unreadConversations.value = [...unreadConversations.value]
      return
    }

    unreadConversations.value = [...unreadConversations.value, conversation]
  }

  function clearUnread(peerId: string) {
    unreadConversations.value = unreadConversations.value.filter(item => item.characterId !== peerId)
  }

  function findWindow(peerId: string) {
    return privateWindows.value.find(window => window.peerId === peerId)
  }

  function upsertWindow(peerId: string, nickname: string) {
    const existing = findWindow(peerId)
    if (existing) {
      existing.nickname = nickname || existing.nickname
      privateWindows.value = [...privateWindows.value]
      return existing
    }

    const created: PrivateChatWindow = {
      peerId,
      nickname,
      messages: [],
      nextCursor: null,
      hasMore: true,
      loading: false,
      minimized: false,
      unread: 0,
    }
    privateWindows.value = [...privateWindows.value, created]
    return created
  }

  function appendPrivateMessage(peerId: string, nickname: string, message: ChatMessage, markUnread = false) {
    const window = upsertWindow(peerId, nickname)
    if (!window.messages.some(item => item.id && item.id === message.id)) {
      window.messages = [...window.messages, message]
    }
    if (markUnread) {
      window.unread += 1
      window.minimized = true
      upsertUnread({
        characterId: peerId,
        nickname,
        unreadCount: window.unread,
      })
    }
    privateWindows.value = [...privateWindows.value]
  }

  async function loadUnread() {
    if (!auth.isLoggedIn()) return
    try {
      const response = await $fetch<{ total: number; conversations: PrivateConversationSummary[] }>('/api/chat/unread', {
        headers: auth.getHeaders(),
      })
      unreadConversations.value = response.conversations
      for (const window of privateWindows.value) {
        const conversation = response.conversations.find(item => item.characterId === window.peerId)
        window.unread = conversation?.unreadCount || 0
      }
      privateWindows.value = [...privateWindows.value]
    } catch {
      unreadConversations.value = []
    }
  }

  async function connect() {
    if (!auth.isLoggedIn() || !auth.character.value) return

    await loadUnread()

    if (!isRealtimeEnabled.value) {
      connectionState.value = 'disconnected'
      return
    }

    const client = await ensurePusher()
    if (!client) return

    if (!connectionBound) {
      connectionBound = true
      connectionState.value = 'connecting'
      client.connection.bind('state_change', ({ current }: { current: string }) => {
        if (current === 'connected') connectionState.value = 'connected'
        else if (current === 'connecting') connectionState.value = 'connecting'
        else connectionState.value = 'disconnected'
      })
    }

    if (!worldChannel) {
      worldChannel = client.subscribe('presence-world')
    }
    if (!worldBound) {
      worldBound = true
      worldChannel.bind('pusher:subscription_succeeded', (members: any) => {
        onlineCount.value = members?.count || 0
      })
      worldChannel.bind('pusher:member_added', () => {
        onlineCount.value += 1
      })
      worldChannel.bind('pusher:member_removed', () => {
        onlineCount.value = Math.max(0, onlineCount.value - 1)
      })
      worldChannel.bind('world-message', (message: ChatMessage) => {
        appendWorldMessage(message)
      })
    }

    if (!privateChannel) {
      privateChannel = client.subscribe(`private-user-${auth.character.value.id}`)
    }
    if (!privateBound) {
      privateBound = true
      privateChannel.bind('private-message', (message: ChatMessage) => {
        const nickname = message.from?.nickname || '未知道友'
        const peerId = message.from?.id || ''
        if (!peerId) return
        appendPrivateMessage(peerId, nickname, message, true)
      })
    }
  }

  async function disconnect() {
    if (pusherClient) {
      pusherClient.disconnect()
    }
    pusherClient = null
    pusherPromise = null
    worldChannel = null
    privateChannel = null
    worldBound = false
    privateBound = false
    connectionBound = false
    onlineCount.value = 0
    connectionState.value = 'disconnected'
  }

  async function sendWorldMessage(content: string) {
    const response = await $fetch<{ ok: boolean; message: ChatMessage }>('/api/chat/world', {
      method: 'POST',
      headers: auth.getHeaders(),
      body: { content },
    })

    if (!isRealtimeEnabled.value) {
      appendWorldMessage(response.message)
    }

    return response.message
  }

  async function loadPrivateHistory(peerId: string, nickname: string, cursor?: string | null) {
    const window = upsertWindow(peerId, nickname)
    if (window.loading) return
    window.loading = true
    privateWindows.value = [...privateWindows.value]

    try {
      const response = await $fetch<{ items: ChatMessage[]; nextCursor: string | null }>(`/api/chat/private/${peerId}`, {
        headers: auth.getHeaders(),
        query: cursor ? { cursor, limit: 50 } : { limit: 50 },
      })

      if (cursor) {
        window.messages = [...response.items, ...window.messages]
      } else {
        window.messages = response.items
      }
      window.nextCursor = response.nextCursor
      window.hasMore = !!response.nextCursor
      window.unread = 0
      window.minimized = false
      clearUnread(peerId)
    } finally {
      window.loading = false
      privateWindows.value = [...privateWindows.value]
      await loadUnread()
    }
  }

  async function openPrivateChat(peerId: string, nickname: string) {
    const window = upsertWindow(peerId, nickname)
    window.minimized = false
    privateWindows.value = [...privateWindows.value]
    if (window.messages.length === 0) {
      await loadPrivateHistory(peerId, nickname)
    } else {
      window.unread = 0
      clearUnread(peerId)
      await loadUnread()
    }
  }

  function closePrivateChat(peerId: string) {
    privateWindows.value = privateWindows.value.filter(window => window.peerId !== peerId)
  }

  function togglePrivateChat(peerId: string) {
    const window = findWindow(peerId)
    if (!window) return
    window.minimized = !window.minimized
    privateWindows.value = [...privateWindows.value]
  }

  async function sendPrivateMessage(peerId: string, nickname: string, content: string) {
    const response = await $fetch<{ ok: boolean; message: ChatMessage }>(`/api/chat/private/${peerId}`, {
      method: 'POST',
      headers: auth.getHeaders(),
      body: { content },
    })

    appendPrivateMessage(peerId, nickname, response.message)
    return response.message
  }

  return {
    worldMessages,
    privateWindows,
    unreadConversations,
    activeTab,
    onlineCount,
    connectionState,
    totalUnread,
    isRealtimeEnabled,
    connect,
    disconnect,
    loadUnread,
    appendWorldMessage,
    sendWorldMessage,
    openPrivateChat,
    closePrivateChat,
    togglePrivateChat,
    loadPrivateHistory,
    sendPrivateMessage,
  }
}
