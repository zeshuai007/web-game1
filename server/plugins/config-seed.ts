import { isConfigEmpty } from '../utils/config'

/**
 * 启动时自动初始化配置表（全新数据库开箱即用）。
 *
 * seedConfig 全部为 upsert/do-nothing，多实例并发启动安全。
 * 单次检查只是一条 count 查询，冷启动开销可忽略。
 */
export default defineNitroPlugin(async () => {
  try {
    const db = useDB()
    if (await isConfigEmpty(db)) {
      const { seedConfig } = await import('../db/seed')
      await seedConfig(db)
      console.log('[config-seed] 配置表为空，已完成自动初始化')
    }
  } catch (err) {
    // 不阻塞启动：注册等接口有默认值兜底，下次实例启动会重试
    console.error('[config-seed] 自动初始化失败（将在下次启动重试）:', err)
  }
})
