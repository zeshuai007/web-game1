interface Character {
  id: string
  userId: string
  nickname: string
  realm: string
  realmLayer: number
  lingqi: string
  lingqiCap: string
  lingshi: string
  lingshiRate: string
  lingqiRate: string
  offlineStartedAt: string
}

function getToken(): string | null {
  if (process.client) {
    return localStorage.getItem('token')
  }
  return null
}

function setToken(val: string | null) {
  if (process.client) {
    if (val) {
      localStorage.setItem('token', val)
    } else {
      localStorage.removeItem('token')
    }
  }
}

function getUserId(): string | null {
  if (process.client) {
    return localStorage.getItem('userId')
  }
  return null
}

function setUserId(val: string | null) {
  if (process.client) {
    if (val) {
      localStorage.setItem('userId', val)
    } else {
      localStorage.removeItem('userId')
    }
  }
}

export function useAuth() {
  const token = ref<string | null>(getToken())
  const userId = ref<string | null>(getUserId())
  const character = ref<Character | null>(null)
  const loading = ref(true)

  function setAuth(newToken: string, newUserId: string) {
    token.value = newToken
    userId.value = newUserId
    setToken(newToken)
    setUserId(newUserId)
  }

  function clearAuth() {
    token.value = null
    userId.value = null
    character.value = null
    setToken(null)
    setUserId(null)
  }

  function getHeaders() {
    const t = token.value || getToken()
    return t ? { Authorization: `Bearer ${t}` } : {}
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
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    setAuth(res.token, res.userId)
    await fetchMe()
    return res
  }

  async function register(email: string, password: string, nickname?: string) {
    const res = await $fetch('/api/auth/register', {
      method: 'POST',
      body: { email, password, nickname },
    })
    setAuth(res.token, res.userId)
    await fetchMe()
    return res
  }

  function isLoggedIn() {
    return !!(token.value || getToken())
  }

  return { token, userId, character, loading, login, register, fetchMe, clearAuth, getHeaders, isLoggedIn, setAuth }
}

export const auth = useAuth()
