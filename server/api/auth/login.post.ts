import { eq } from 'drizzle-orm'
import bcrypt from 'bcrypt'
import { users } from '../../db/schema'

export default defineEventHandler(async (event) => {
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
})
