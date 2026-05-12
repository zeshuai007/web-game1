<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden bg-login-bg bg-cover bg-center">
    <div class="absolute inset-0 bg-ink-950/60"></div>

    <div class="relative z-10 w-full max-w-md px-6">
      <div class="text-center mb-10">
        <h1 class="font-title text-5xl text-gold-400 mb-2 tracking-widest">仙 逆</h1>
        <p class="text-ink-300">踏入修仙之路</p>
      </div>

      <div class="bg-ink-900/80 border border-ink-700 rounded-lg p-8 backdrop-blur-sm">
        <h2 class="text-xl font-bold text-center mb-6 text-gold-300">注 册</h2>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm text-ink-300 mb-1">道号（昵称）</label>
            <input v-model="nickname" type="text" placeholder="给自己取个道号" maxlength="20"
              class="w-full px-4 py-2.5 bg-ink-950 border border-ink-600 rounded focus:border-jade-500 focus:outline-none text-ink-100 placeholder-ink-500 transition-colors">
          </div>
          <div>
            <label class="block text-sm text-ink-300 mb-1">邮箱 *</label>
            <input v-model="email" type="email" placeholder="请输入邮箱" required
              class="w-full px-4 py-2.5 bg-ink-950 border border-ink-600 rounded focus:border-jade-500 focus:outline-none text-ink-100 placeholder-ink-500 transition-colors">
          </div>
          <div>
            <label class="block text-sm text-ink-300 mb-1">密码 *</label>
            <input v-model="password" type="password" placeholder="至少6位" required minlength="6"
              class="w-full px-4 py-2.5 bg-ink-950 border border-ink-600 rounded focus:border-jade-500 focus:outline-none text-ink-100 placeholder-ink-500 transition-colors">
          </div>

          <button type="submit" :disabled="loading"
            class="w-full py-2.5 bg-jade-700 hover:bg-jade-600 text-white rounded transition-colors font-bold tracking-wider disabled:opacity-50">
            {{ loading ? '注册中...' : '踏上修仙路' }}
          </button>
        </form>

        <div v-if="error" class="mt-4 text-blood-400 text-sm text-center">{{ error }}</div>

        <div class="mt-6 text-center text-sm text-ink-400">
          已有道号？
          <NuxtLink to="/" class="text-jade-400 hover:text-jade-300 underline">返回登录</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { auth } from '~/composables/useAuth'

const router = useRouter()
const nickname = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

onMounted(() => {
  if (auth.isLoggedIn()) {
    router.push('/cultivate')
  }
})

async function handleRegister() {
  loading.value = true
  error.value = ''
  try {
    await auth.register(email.value, password.value, nickname.value || undefined)
    router.push('/cultivate')
  } catch (e) {
    error.value = e.data?.message || e.message || '注册失败'
  } finally {
    loading.value = false
  }
}
</script>
