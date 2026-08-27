import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { users } from '../../db/schema'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = body || {}

    if (!email || !password) {
      throw createError({ statusCode: 400, message: '邮箱和密码不能为空' })
    }

    const db = useDB()

    const [user] = await db.select().from(users).where(eq(users.email, email))
    if (!user) {
      throw createError({ statusCode: 401, message: '邮箱或密码错误' })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      throw createError({ statusCode: 401, message: '邮箱或密码错误' })
    }

    const token = signToken({ userId: user.id })

    return { token, userId: user.id }
  } catch (error: any) {
    if (error?.statusCode && error.statusCode < 500) throw error
    console.error('[auth/login] unexpected error', error)
    throw createError({ statusCode: 503, message: '服务暂时不可用，请稍后重试' })
  }
})
