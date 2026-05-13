import { eq } from 'drizzle-orm'
import { users, characters, configRealms } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const db = useDB()

  const [user] = await db.select().from(users).where(eq(users.id, userId))
  if (!user) {
    throw createError({ statusCode: 404, message: '用户不存在' })
  }

  const char = await useCharacter(event)
  const [configuredRealm] = await db.select().from(configRealms).where(eq(configRealms.key, char.realm)).limit(1)

  let nextChar = char
  if (configuredRealm) {
    const nextCap = String(parseFloat(configuredRealm.lingqiCap))
    const nextLingqiRate = String(parseFloat(configuredRealm.lingqiRate))
    const nextLingshiRate = String(parseFloat(configuredRealm.lingshiRate))
    if (char.lingqiCap !== nextCap || char.lingqiRate !== nextLingqiRate || char.lingshiRate !== nextLingshiRate) {
      const [updated] = await db.update(characters)
        .set({
          lingqiCap: nextCap,
          lingqiRate: nextLingqiRate,
          lingshiRate: nextLingshiRate,
          updatedAt: new Date(),
        })
        .where(eq(characters.id, char.id))
        .returning()
      nextChar = updated ?? char
    }
  }

  return {
    user: { id: user.id, email: user.email },
    character: nextChar,
  }
})
