import { test, expect } from '@playwright/test'

test.describe.serial('核心用户旅程', () => {
  const ts = Date.now()
  const email = `e2e_${ts}@test.com`
  const pw = 'e2etest123'

  test('P1: 注册新用户', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('input[type="email"]', { timeout: 15000 })
    await page.fill('input[maxlength="20"]', 'E2E测试')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', pw)
    await page.click('button:has-text("踏上修仙路")')
    await page.waitForURL('/cultivate', { timeout: 10000 })
    await expect(page.locator('text=E2E测试')).toBeVisible({ timeout: 8000 })
  })

  test('P2: 登录已有用户', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('input[type="email"]', { timeout: 15000 })
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', pw)
    await page.click('button:has-text("踏入修仙路")')
    await page.waitForURL('/cultivate', { timeout: 10000 })
    await expect(page.locator('p.text-jade-400').filter({ hasText: '凝气期 · 第1层' })).toBeVisible({ timeout: 8000 })
  })

  test('P3: 错误登录', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('input[type="email"]', { timeout: 15000 })
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button:has-text("踏入修仙路")')
    await expect(page.locator('text=邮箱或密码错误')).toBeVisible({ timeout: 5000 })
  })

  test('P4: 页面直接加载', async ({ page }) => {
    // Login first, then navigate directly via URL to avoid modal intercept
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('input[type="email"]', { timeout: 15000 })
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', pw)
    await page.click('button:has-text("踏入修仙路")')
    await page.waitForURL('/cultivate', { timeout: 10000 })

    // Shop page
    await page.goto('/shop', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('text=幽魂草')).toBeVisible({ timeout: 10000 })

    // Alchemy page
    await page.goto('/alchemy', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('text=培元丹')).toBeVisible({ timeout: 10000 })

    // Rankings
    await page.goto('/rankings', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('text=排 行')).toBeVisible({ timeout: 10000 })
  })

  test('P5: 登录页展示', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('text=仙 逆')).toBeVisible({ timeout: 8000 })
    await expect(page.locator('text=踏入修仙路')).toBeVisible()
    await expect(page.locator('text=尚无道号')).toBeVisible()
  })

  test('P5.1: 注册页不会因为全局私聊浮窗而崩溃', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('text=Internal Server Error')).toHaveCount(0)
    await expect(page.locator('button:has-text("踏上修仙路")')).toBeVisible({ timeout: 8000 })
  })

  test('P6: 突破失败后保留进度并显示保底', async ({ page }) => {
    const p6Email = `e2e_p6_${Date.now()}@test.com`

    await page.goto('/register', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('input[type="email"]', { timeout: 15000 })
    await page.fill('input[maxlength="20"]', '保底测试')
    await page.fill('input[type="email"]', p6Email)
    await page.fill('input[type="password"]', pw)
    await page.click('button:has-text("踏上修仙路")')
    await page.waitForURL('/cultivate', { timeout: 10000 })

    await page.evaluate(async () => {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('missing token')

      const meRes = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const me = await meRes.json()

      await fetch('/api/test/char-resource', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          characterId: me.character.id,
          realm: 'condensing_qi',
          realmLayer: 9,
          lingqi: 150,
          lingqiCap: 150,
          lingqiRate: 15,
          lingshiRate: 15,
          breakthroughFailureCount: 0,
        }),
      })

      await fetch('/api/adventure/clear', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
    })

    const adventureRoute = async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ event: null }),
      })
    }

    await page.route('**/api/adventure/pending', adventureRoute)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.locator('button').filter({ hasText: '突 破' })).toBeVisible({ timeout: 10000 })

    const breakthroughRoute = async (route: any) => {
      await route.continue({
        headers: {
          ...route.request().headers(),
          'x-test-breakthrough-roll': '0.95',
        },
      })
    }

    await page.route('**/api/cultivate/breakthrough', breakthroughRoute)
    await page.click('button:has-text("突 破")')
    await page.click('button:has-text("直接突破")')
    await page.unroute('**/api/cultivate/breakthrough', breakthroughRoute)
    await page.unroute('**/api/adventure/pending', adventureRoute)

    await expect(page.locator('p.text-blood-400').filter({ hasText: '突破失败，灵气溃散，需重新积累' })).toBeVisible({ timeout: 10000 })
    await page.click('button:has-text("返回")')

    const progressCard = page.locator('div').filter({ hasText: '修炼进度（灵气）' }).first()
    await expect(progressCard).toContainText('75')
    await expect(progressCard).toContainText('150')
    await expect(page.locator('body')).toContainText('连败 1 次')
    await expect(page.locator('body')).toContainText('当前保底加成 +5%')
  })
})
