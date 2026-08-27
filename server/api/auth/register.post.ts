import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { users, characters, configRealms } from '../../db/schema'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password, nickname } = body || {}

    if (!email || !password) {
      throw createError({ statusCode: 400, message: '邮箱和密码不能为空' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw createError({ statusCode: 400, message: '邮箱格式不正确' })
    }

    if (password.length < 6) {
      throw createError({ statusCode: 400, message: '密码至少6位' })
    }

    const db = useDB()

    const [existing] = await db.select().from(users).where(eq(users.email, email))
    if (existing) {
      throw createError({ statusCode: 409, message: '该邮箱已注册' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const [user] = await db.insert(users).values({ email, passwordHash }).returning()

    const [configuredRealm] = await db.select().from(configRealms).where(eq(configRealms.key, 'condensing_qi')).limit(1)
    const cfg = configuredRealm
      ? {
          lingqiCap: parseFloat(configuredRealm.lingqiCap),
          lingshiRate: parseFloat(configuredRealm.lingshiRate),
          lingqiRate: parseFloat(configuredRealm.lingqiRate),
        }
      : realmConfigs['condensing_qi']

    await db.insert(characters).values({
      userId: user.id,
      nickname: nickname || '无名散修',
      lingqiCap: String(cfg.lingqiCap),
      lingshiRate: String(cfg.lingshiRate),
      lingqiRate: String(cfg.lingqiRate),
    })

    const token = signToken({ userId: user.id })

    return { token, userId: user.id }
  } catch (error: any) {
    if (error?.statusCode && error.statusCode < 500) throw error
    console.error('[auth/register] unexpected error', error)
    throw createError({ statusCode: 503, message: '服务暂时不可用，请稍后重试' })
  }
})
