import { pgTable, uuid, varchar, integer, timestamp, uniqueIndex, decimal } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const realmEnum = [
  'condensing_qi',
  'foundation',
  'core_formation',
  'nascent_soul',
  'deity_transformation',
  'nascent_transformation',
  'seeking_heaven',
] as const

export type Realm = typeof realmEnum[number]

export const realmLabels: Record<Realm, string> = {
  condensing_qi: '凝气期',
  foundation: '筑基期',
  core_formation: '结丹期',
  nascent_soul: '元婴期',
  deity_transformation: '化神期',
  nascent_transformation: '婴变期',
  seeking_heaven: '问鼎期',
}

export const characters = pgTable('characters', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  nickname: varchar('nickname', { length: 50 }).notNull().default('无名散修'),
  realm: varchar('realm', { length: 50 }).notNull().default('condensing_qi'),
  realmLayer: integer('realm_layer').notNull().default(1),
  lingqi: decimal('lingqi', { precision: 20, scale: 4 }).notNull().default('0'),
  lingqiCap: decimal('lingqi_cap', { precision: 20, scale: 4 }).notNull().default('100'),
  lingshi: decimal('lingshi', { precision: 20, scale: 4 }).notNull().default('0'),
  lingshiRate: decimal('lingshi_rate', { precision: 10, scale: 4 }).notNull().default('1'),
  lingqiRate: decimal('lingqi_rate', { precision: 10, scale: 4 }).notNull().default('1'),
  offlineStartedAt: timestamp('offline_started_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: uniqueIndex('user_id_idx').on(table.userId),
}))

export const itemTypeEnum = ['pill', 'material'] as const

export const inventory = pgTable('inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterId: uuid('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  itemType: varchar('item_type', { length: 50 }).notNull(),
  itemId: varchar('item_id', { length: 100 }).notNull(),
  quantity: integer('quantity').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const pillTypeEnum = [
  'peiyuan_dan',      // 培元丹 - 凝气修炼
  'qihuang_dan',      // 岐黄丹 - 筑基修炼
  'qianji_dan',       // 千机丹 - 结丹修炼
  'taiyi_dan',        // 太乙丹 - 元婴修炼
  'tianyun_dan',      // 天韵丹 - 化神修炼
  'xuanyuan_dan',     // 玄元丹 - 婴变修炼
  'wendao_dan',       // 问道丹 - 问鼎修炼
  'zhuji_dan',        // 筑基丹 - 凝气→筑基突破
  'tianli_dan',       // 天离丹 - 筑基→结丹突破
  'qingyun_dan',      // 青云丹 - 结丹→元婴突破
  'huashen_dan',      // 化神丹 - 元婴→化神突破
  'yingbian_dan',     // 婴变丹 - 化神→婴变突破
  'wending_dan',      // 问鼎丹 - 婴变→问鼎突破
] as const

export type PillType = typeof pillTypeEnum[number]

export const alchemyRecords = pgTable('alchemy_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterId: uuid('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  pillType: varchar('pill_type', { length: 100 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
