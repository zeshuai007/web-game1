import { eq } from 'drizzle-orm'
import { users, characters, configRealms } from '../../db/schema'
import { type Realm } from '../../utils/realm-config'
import { getRealmFromDB } from '../../utils/config'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const db = useDB()

  const [user] = await db.select().from(users).where(eq(users.id, userId))
  if (!user) {
    throw createError({ statusCode: 404, message: '用户不存在' })
  }

  const char = await useCharacter(event)
  const cfg = await getRealmFromDB(db, char.realm as Realm)

  let nextChar = char
  if (cfg) {
    const nextCap = String(cfg.lingqiCap)
    const nextLingqiRate = String(cfg.lingqiRate)
    const nextLingshiRate = String(cfg.lingshiRate)
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