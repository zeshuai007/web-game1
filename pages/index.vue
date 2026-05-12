<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden bg-login-bg bg-cover bg-center">
    <!-- Dark overlay -->
    <div class="absolute inset-0 bg-ink-950/60"></div>

    <div class="relative z-10 w-full max-w-md px-6">
      <!-- Title -->
      <div class="text-center mb-10">
        <h1 class="font-title text-6xl text-gold-400 mb-2 tracking-widest" style="text-shadow: 0 0 30px rgba(245, 180, 10, 0.3);">仙 逆</h1>
        <p class="text-ink-300 text-lg tracking-wider">放置 · 修仙 · 问道</p>
      </div>

      <!-- Login Card -->
      <div class="bg-ink-900/80 border border-ink-700 rounded-lg p-8 backdrop-blur-sm">
        <h2 class="text-xl font-bold text-center mb-6 text-gold-300">登 录</h2>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm text-ink-300 mb-1">道号 / 邮箱</label>
            <input v-model="email" type="email" placeholder="请输入邮箱" required
              class="w-full px-4 py-2.5 bg-ink-950 border border-ink-600 rounded focus:border-jade-500 focus:outline-none text-ink-100 placeholder-ink-500 transition-colors">
          </div>
          <div>
            <label class="block text-sm text-ink-300 mb-1">密码</label>
            <input v-model="password" type="password" placeholder="请输入密码" required
              class="w-full px-4 py-2.5 bg-ink-950 border border-ink-600 rounded focus:border-jade-500 focus:outline-none text-ink-100 placeholder-ink-500 transition-colors">
          </div>

          <button type="submit" :disabled="loading"
            class="w-full py-2.5 bg-jade-700 hover:bg-jade-600 text-white rounded transition-colors font-bold tracking-wider disabled:opacity-50">
            {{ loading ? '入定中...' : '踏入修仙路' }}
          </button>
        </form>

        <div v-if="error" class="mt-4 text-blood-400 text-sm text-center">{{ error }}</div>

        <div class="mt-6 text-center text-sm text-ink-400">
          尚无道号？
          <NuxtLink to="/register" class="text-jade-400 hover:text-jade-300 underline">即刻注册</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { auth } from '~/composables/useAuth'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

onMounted(() => {
  if (auth.isLoggedIn()) {
    router.push('/cultivate')
  }
})

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    router.push('/cultivate')
  } catch (e) {
    error.value = e.data?.message || e.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>
