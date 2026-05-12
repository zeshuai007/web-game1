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
    await expect(page.locator('text=凝气期')).toBeVisible({ timeout: 8000 })
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
})
