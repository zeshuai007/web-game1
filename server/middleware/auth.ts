import { eq } from 'drizzle-orm'
import { users } from '../db/schema'

const publicRoutes = ['/api/auth/register', '/api/auth/login', '/api/config/game', '/api/rankings']

export default defineEventHandler(async (event) => {
  // Only apply to API routes
  if (!event.path.startsWith('/api/')) return
  if (publicRoutes.includes(event.path)) return

  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: '未登录' })
  }

  try {
    const token = authHeader.slice(7)
    const payload = verifyToken(token)
    const db = useDB()
    const [user] = await db.select().from(users).where(eq(users.id, payload.userId))
    if (!user) {
      throw createError({ statusCode: 401, message: '用户不存在' })
    }
    event.context.userId = payload.userId
  } catch (e: any) {
    if (e.statusCode) throw e
    throw createError({ statusCode: 401, message: '登录已过期，请重新登录' })
  }
})
