interface Character {
  id: string; userId: string; nickname: string; realm: string
  realmLayer: number; lingqi: string; lingqiCap: string; lingshi: string
  lingshiRate: string; lingqiRate: string; breakthroughFailureCount: number; offlineStartedAt: string
}

function loadFromStorage(key: string): string | null {
  if (process.client) return localStorage.getItem(key)
  return null
}

function saveToStorage(key: string, val: string | null) {
  if (process.client) {
    if (val) localStorage.setItem(key, val)
    else localStorage.removeItem(key)
  }
}

export function useAuth() {
  const token = ref<string | null>(loadFromStorage('token'))
  const userId = ref<string | null>(loadFromStorage('userId'))
  const character = ref<Character | null>(null)

  function setAuth(newToken: string, newUserId: string) {
    token.value = newToken
    userId.value = newUserId
    saveToStorage('token', newToken)
    saveToStorage('userId', newUserId)
  }

  function clearAuth() {
    token.value = null
    userId.value = null
    character.value = null
    saveToStorage('token', null)
    saveToStorage('userId', null)
  }

  function getHeaders() {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  async function fetchMe() {
    try {
      const res = await $fetch('/api/auth/me', { headers: getHeaders() })
      if (res.character?.nickname) {
        character.value = res.character
      } else {
        clearAuth()
      }
      return res
    } catch {
      clearAuth()
      return null
    }
  }

  async function login(email: string, password: string) {
    const res = await $fetch('/api/auth/login', { method: 'POST', body: { email, password } })
    setAuth(res.token, res.userId)
    await fetchMe()
    return res
  }

  async function register(email: string, password: string, nickname?: string) {
    const res = await $fetch('/api/auth/register', { method: 'POST', body: { email, password, nickname } })
    setAuth(res.token, res.userId)
    await fetchMe()
    return res
  }

  function isLoggedIn() {
    return !!token.value
  }

  return { token, userId, character, loading: ref(false), login, register, fetchMe, clearAuth, getHeaders, isLoggedIn, setAuth }
}

export const auth = useAuth()
