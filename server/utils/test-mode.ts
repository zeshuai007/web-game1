/**
 * Test-only helpers gate.
 *
 * Test endpoints (/api/test/*) and test-only request headers
 * (e.g. x-test-breakthrough-roll) are DISABLED in production by default.
 *
 * Override with env var TEST_ENDPOINTS_ENABLED:
 *   '1' → force enabled (even in production, e.g. a staging deploy)
 *   '0' → force disabled (even in development)
 */
export function isTestModeEnabled(): boolean {
  const override = process.env.TEST_ENDPOINTS_ENABLED
  if (override === '1') return true
  if (override === '0') return false
  return process.env.NODE_ENV !== 'production'
}
