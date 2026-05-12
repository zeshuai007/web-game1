<template>
  <header class="border-b border-ink-700 bg-ink-900/90 backdrop-blur-sm">
    <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
      <NuxtLink to="/cultivate" class="font-title text-xl text-gold-400 tracking-widest">仙 逆</NuxtLink>

      <nav class="flex items-center gap-1">
        <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to"
          class="px-3 py-1.5 text-sm rounded transition-colors"
          :class="$route.path === item.to ? 'bg-ink-700 text-gold-300' : 'text-ink-300 hover:text-ink-100 hover:bg-ink-800'">
          {{ item.label }}
        </NuxtLink>
        <button @click="handleLogout" class="ml-4 px-3 py-1.5 text-sm text-ink-400 hover:text-blood-400 transition-colors">
          退出
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { auth } from '~/composables/useAuth'

const router = useRouter()
const route = useRoute()

const navItems = [
  { to: '/cultivate', label: '修炼' },
  { to: '/alchemy', label: '丹房' },
  { to: '/shop', label: '坊市' },
  { to: '/rankings', label: '排行榜' },
]

function handleLogout() {
  auth.clearAuth()
  router.push('/')
}
</script>
