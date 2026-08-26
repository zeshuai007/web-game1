import { eq, sql } from 'drizzle-orm'
import { characters, realmLabels, type Realm } from '../db/schema'
import { verifyToken } from '../utils/jwt'

// 排行与「我的排名」共用的排序规则（境界 → 层数 → 灵气）
const RANK_ORDER = sql`CASE
  WHEN ${characters.realm} = 'seeking_heaven' THEN 7
  WHEN ${characters.realm} = 'nascent_transformation' THEN 6
  WHEN ${characters.realm} = 'deity_transformation' THEN 5
  WHEN ${characters.realm} = 'nascent_soul' THEN 4
  WHEN ${characters.realm} = 'core_formation' THEN 3
  WHEN ${characters.realm} = 'foundation' THEN 2
  WHEN ${characters.realm} = 'condensing_qi' THEN 1
  ELSE 0
END DESC, ${characters.realmLayer} DESC, ${characters.lingqi} DESC`

export default defineEventHandler(async (event) => {
  const db = useDB()

  // 排行榜公开可浏览；携带有效 token 时附带「我的排名」（PRD US16）
  let meCharacterId: string | null = null
  const authHeader = getHeader(event, 'authorization')
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const { userId } = verifyToken(authHeader.slice(7))
      const [me] = await db.select({ id: characters.id }).from(characters).where(eq(characters.userId, userId)).limit(1)
      meCharacterId = me?.id ?? null
    } catch {
      // 无效/过期 token 视作未登录游客
    }
  }

  const rankings = await db.select({
    id: characters.id,
    nickname: characters.nickname,
    realm: characters.realm,
    realmLayer: characters.realmLayer,
    lingqi: characters.lingqi,
  })
    .from(characters)
    .orderBy(sql`CASE
      WHEN ${characters.realm} = 'seeking_heaven' THEN 7
      WHEN ${characters.realm} = 'nascent_transformation' THEN 6
      WHEN ${characters.realm} = 'deity_transformation' THEN 5
      WHEN ${characters.realm} = 'nascent_soul' THEN 4
      WHEN ${characters.realm} = 'core_formation' THEN 3
      WHEN ${characters.realm} = 'foundation' THEN 2
      WHEN ${characters.realm} = 'condensing_qi' THEN 1
      ELSE 0
    END DESC`, sql`${characters.realmLayer} DESC`, sql`${characters.lingqi} DESC`)
    .limit(100)

  let myRank: number | null = null
  let myLingqi: string | null = null
  let myRealm: Realm | null = null
  let myRealmLayer: number | null = null

  if (meCharacterId) {
    const result = await db.execute(sql`
      WITH ranked AS (
        SELECT ${characters.id} AS id,
               ROW_NUMBER() OVER (ORDER BY ${RANK_ORDER}) AS rk,
               ${characters.lingqi} AS lingqi,
               ${characters.realm} AS realm,
               ${characters.realmLayer} AS realm_layer
        FROM ${characters}
      )
      SELECT rk, lingqi, realm, realm_layer FROM ranked WHERE id = ${meCharacterId}
    `)
    const row = (result as any).rows?.[0]
    if (row) {
      myRank = Number(row.rk)
      myLingqi = row.lingqi
      myRealm = row.realm
      myRealmLayer = Number(row.realm_layer)
    }
  }

  return {
    rankings: rankings.map((r, idx) => ({
      rank: idx + 1,
      isMe: meCharacterId === r.id,
      nickname: r.nickname,
      realm: realmLabels[r.realm as Realm] || r.realm,
      realmLayer: r.realmLayer,
      lingqi: r.lingqi,
    })),
    me: meCharacterId ? { rank: myRank, lingqi: myLingqi, realm: myRealm ? (realmLabels[myRealm] || myRealm) : null, realmLayer: myRealmLayer } : null,
  }
})
