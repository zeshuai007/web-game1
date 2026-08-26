import { eq } from 'drizzle-orm'
import { characters, adventureEvents as adventureTable } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  const db = useDB()
  const char = await useCharacter(event)

  // 彻底清除该角色的奇遇记录（含历史）：
  // 既结束未决事件，也重置触发冷却（#70）
  await db.delete(adventureTable)
    .where(eq(adventureTable.characterId, char.id))

  return { success: true }
})
