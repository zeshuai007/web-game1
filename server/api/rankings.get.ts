import { desc, sql } from 'drizzle-orm'
import { characters, realmLabels, type Realm } from '../db/schema'

export default defineEventHandler(async () => {
  const db = useDB()

  const rankings = await db.select({
    nickname: characters.nickname,
    realm: characters.realm,
    realmLayer: characters.realmLayer,
    lingqi: characters.lingqi,
    lingshi: characters.lingshi,
  })
    .from(characters)
    .orderBy(
      desc(sql`CASE
        WHEN realm = 'seeking_heaven' THEN 7
        WHEN realm = 'nascent_transformation' THEN 6
        WHEN realm = 'deity_transformation' THEN 5
        WHEN realm = 'nascent_soul' THEN 4
        WHEN realm = 'core_formation' THEN 3
        WHEN realm = 'foundation' THEN 2
        WHEN realm = 'condensing_qi' THEN 1
      END`),
      desc(characters.realmLayer),
      desc(characters.lingqi),
    )
    .limit(100)

  return {
    rankings: rankings.map((r, idx) => ({
      rank: idx + 1,
      nickname: r.nickname,
      realm: realmLabels[r.realm as Realm] || r.realm,
      realmLayer: r.realmLayer,
      lingqi: r.lingqi,
    })),
  }
})
