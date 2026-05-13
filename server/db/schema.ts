import { pgTable, uuid, varchar, integer, timestamp, uniqueIndex, decimal } from 'drizzle-orm/pg-core'

// ─── Configuration tables ───────────────────────────────────────
export const configRealms = pgTable('config_realms', {
  key: varchar('key', { length: 50 }).primaryKey(),
  label: varchar('label', { length: 50 }).notNull(),
  lingqiCap: decimal('lingqi_cap', { precision: 10, scale: 2 }).notNull(),
  lingshiRate: decimal('lingshi_rate', { precision: 10, scale: 2 }).notNull(),
  lingqiRate: decimal('lingqi_rate', { precision: 10, scale: 2 }).notNull(),
  breakthroughChance: decimal('breakthrough_chance', { precision: 4, scale: 2 }).notNull(),
  maxLayer: integer('max_layer').notNull().default(3),
  progressRetainRate: decimal('progress_retain_rate', { precision: 4, scale: 2 }),
  pityChanceStep: decimal('pity_chance_step', { precision: 4, scale: 2 }),
  pityChanceMax: decimal('pity_chance_max', { precision: 4, scale: 2 }),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const configShopItems = pgTable('config_shop_items', {
  itemId: varchar('item_id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 200 }).notNull().default(''),
  price: integer('price').notNull(),
  itemType: varchar('item_type', { length: 50 }).notNull().default('material'),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const configForgeRecipes = pgTable('config_forge_recipes', {
  recipeId: varchar('recipe_id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slot: varchar('slot', { length: 20 }).notNull(),
  materialsJson: varchar('materials_json', { length: 500 }).notNull(),
  cost: integer('cost').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const configAlchemyRecipes = pgTable('config_alchemy_recipes', {
  pillId: varchar('pill_id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  materialsJson: varchar('materials_json', { length: 500 }).notNull(),
  cost: integer('cost').notNull(),
  effect: varchar('effect', { length: 100 }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const configAchievementDefs = pgTable('config_achievement_defs', {
  key: varchar('key', { length: 50 }).primaryKey(),
  category: varchar('category', { length: 20 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 200 }).notNull(),
  conditionType: varchar('condition_type', { length: 50 }).notNull(),
  conditionValue: integer('condition_value').notNull().default(0),
  rewardType: varchar('reward_type', { length: 50 }).notNull().default('lingshi'),
  rewardValue: integer('reward_value').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const configMaterialNames = pgTable('config_material_names', {
  itemId: varchar('item_id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

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
  breakthroughFailureCount: integer('breakthrough_failure_count').notNull().default(0),
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

export const friendRequests = pgTable('friend_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromCharacterId: uuid('from_character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  toCharacterId: uuid('to_character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  fromToIdx: uniqueIndex('from_to_idx').on(table.fromCharacterId, table.toCharacterId),
}))

export const clans = pgTable('clans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: varchar('description', { length: 500 }).notNull().default(''),
  level: integer('level').notNull().default(1),
  exp: integer('exp').notNull().default(0),
  leaderCharacterId: uuid('leader_character_id').notNull().references(() => characters.id),
  memberCount: integer('member_count').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const clanMembers = pgTable('clan_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  clanId: uuid('clan_id').notNull().references(() => clans.id, { onDelete: 'cascade' }),
  characterId: uuid('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }).unique(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  contributedExp: integer('contributed_exp').notNull().default(0),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (table) => ({
  clanCharacterIdx: uniqueIndex('clan_character_idx').on(table.clanId, table.characterId),
}))

export const clanTasks = pgTable('clan_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskType: varchar('task_type', { length: 50 }).notNull(),
  title: varchar('title', { length: 100 }).notNull(),
  description: varchar('description', { length: 500 }).notNull(),
  targetCount: integer('target_count').notNull().default(1),
  rewardExp: integer('reward_exp').notNull().default(10),
  rewardContribution: integer('reward_contribution').notNull().default(10),
  taskDate: varchar('task_date', { length: 20 }).notNull(),
})

export const clanTaskProgress = pgTable('clan_task_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  clanTaskId: uuid('clan_task_id').notNull().references(() => clanTasks.id, { onDelete: 'cascade' }),
  characterId: uuid('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  progress: integer('progress').notNull().default(0),
  completed: integer('completed').notNull().default(0),
  claimedAt: timestamp('claimed_at'),
}, (table) => ({
  taskCharIdx: uniqueIndex('task_char_idx').on(table.clanTaskId, table.characterId),
}))

export const achievements = pgTable('achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: varchar('category', { length: 20 }).notNull(),
  key: varchar('key', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 200 }).notNull(),
  conditionType: varchar('condition_type', { length: 50 }).notNull(),
  conditionValue: integer('condition_value').notNull().default(0),
  rewardType: varchar('reward_type', { length: 50 }).notNull().default('lingshi'),
  rewardValue: integer('reward_value').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const characterAchievements = pgTable('character_achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterId: uuid('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  achievementId: uuid('achievement_id').notNull().references(() => achievements.id, { onDelete: 'cascade' }),
  progress: integer('progress').notNull().default(0),
  completed: integer('completed').notNull().default(0),
  completedAt: timestamp('completed_at'),
  claimed: integer('claimed').notNull().default(0),
}, (table) => ({
  charAchIdx: uniqueIndex('char_ach_idx').on(table.characterId, table.achievementId),
}))

export const equipment = pgTable('equipment', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterId: uuid('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  slot: varchar('slot', { length: 20 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  quality: integer('quality').notNull().default(0), // 0=凡器 1=法器 2=宝器 3=灵器 4=仙器
  bonusLingqiRate: decimal('bonus_lingqi_rate', { precision: 10, scale: 2 }).notNull().default('0'),
  bonusLingshiRate: decimal('bonus_lingshi_rate', { precision: 10, scale: 2 }).notNull().default('0'),
  equipped: integer('equipped').notNull().default(0), // 0=背包 1=已穿戴
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const daoRecords = pgTable('dao_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromCharacterId: uuid('from_character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  toCharacterId: uuid('to_character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  daoDate: varchar('dao_date', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  daoFromToDateIdx: uniqueIndex('dao_from_to_date_idx').on(table.fromCharacterId, table.toCharacterId, table.daoDate),
}))

export const adventureEvents = pgTable('adventure_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterId: uuid('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  eventData: varchar('event_data', { length: 1000 }).notNull().default('{}'),
  state: varchar('state', { length: 20 }).notNull().default('pending'),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const signInRecords = pgTable('sign_in_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterId: uuid('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  signDate: varchar('sign_date', { length: 20 }).notNull(),
  consecutiveDays: integer('consecutive_days').notNull().default(1),
  reward: decimal('reward', { precision: 10, scale: 2 }).notNull().default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  characterDateIdx: uniqueIndex('character_date_idx').on(table.characterId, table.signDate),
}))

export const alchemyRecords = pgTable('alchemy_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterId: uuid('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  pillType: varchar('pill_type', { length: 100 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromCharacterId: uuid('from_character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  toCharacterId: uuid('to_character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  content: varchar('content', { length: 200 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const chatReadStates = pgTable('chat_read_states', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterId: uuid('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  peerCharacterId: uuid('peer_character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  lastReadAt: timestamp('last_read_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  characterPeerIdx: uniqueIndex('chat_read_states_character_peer_idx').on(table.characterId, table.peerCharacterId),
}))
