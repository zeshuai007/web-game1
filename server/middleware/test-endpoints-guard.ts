import { isTestModeEnabled } from '../utils/test-mode'

/**
 * Blocks /api/test/** debug endpoints unless test mode is enabled.
 * Production returns 404 so the routes look non-existent.
 */
export default defineEventHandler((event) => {
  if (!event.path.startsWith('/api/test/')) return
  if (isTestModeEnabled()) return
  throw createError({ statusCode: 404, message: 'Not Found' })
})
