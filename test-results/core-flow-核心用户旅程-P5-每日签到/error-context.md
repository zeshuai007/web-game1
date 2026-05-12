# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: core-flow.spec.ts >> 核心用户旅程 >> P5: 每日签到
- Location: tests/e2e/core-flow.spec.ts:60:7

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for locator('button:has-text("签到")')
    - locator resolved to <button class="px-4 py-2 bg-gold-700 hover:bg-gold-600 disabled:bg-ink-700 disabled:text-ink-500 text-white rounded text-sm transition-colors">签到</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">…</div> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">…</div> intercepts pointer events
    - retrying click action
      - waiting 100ms
    77 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">…</div> intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - banner [ref=e7]:
      - generic [ref=e8]:
        - link "仙 逆" [ref=e9] [cursor=pointer]:
          - /url: /cultivate
        - navigation [ref=e10]:
          - link "修炼" [ref=e11] [cursor=pointer]:
            - /url: /cultivate
          - link "丹房" [ref=e12] [cursor=pointer]:
            - /url: /alchemy
          - link "坊市" [ref=e13] [cursor=pointer]:
            - /url: /shop
          - link "排行榜" [ref=e14] [cursor=pointer]:
            - /url: /rankings
          - button "退出" [ref=e15] [cursor=pointer]
    - generic [ref=e16]:
      - generic [ref=e17]:
        - generic [ref=e18]:
          - generic [ref=e20]: E
          - generic [ref=e21]:
            - heading "E2E测试" [level=2] [ref=e22]
            - button "✎" [ref=e23] [cursor=pointer]
          - paragraph [ref=e24]: 凝气期 · 第1层
          - generic [ref=e25]:
            - generic [ref=e26]:
              - generic [ref=e27]: 灵石
              - generic [ref=e28]: "9"
            - generic [ref=e29]:
              - generic [ref=e30]:
                - generic [ref=e31]: 灵气速率
                - generic [ref=e32]: 10.0000/分钟
              - generic [ref=e33]:
                - generic [ref=e34]: 灵石速率
                - generic [ref=e35]: 10.0000/分钟
        - generic [ref=e37]:
          - generic [ref=e38]:
            - heading "每日签到" [level=3] [ref=e39]
            - paragraph [ref=e40]: 连续 0 天
          - button "签到" [ref=e41] [cursor=pointer]
        - generic [ref=e42]:
          - heading "背包" [level=3] [ref=e43]
          - generic [ref=e44]: 空空如也
      - generic [ref=e46]:
        - heading "修炼日志" [level=3] [ref=e47]
        - generic [ref=e48]:
          - generic [ref=e49]: "{ \"version\": 0, \"sc\": 0, \"__v_skip\": true }"
          - generic [ref=e50]: "true"
          - generic [ref=e51]: "false"
          - generic [ref=e52]: "[ \"离线 0 分钟，获得灵气 3，灵石 3\", \"离线 0 分钟，获得灵气 3，灵石 3\", \"离线 0 分钟，获得灵气 1，灵石 1\" ]"
          - generic [ref=e53]: "[ \"离线 0 分钟，获得灵气 3，灵石 3\", \"离线 0 分钟，获得灵气 3，灵石 3\", \"离线 0 分钟，获得灵气 1，灵石 1\" ]"
        - generic [ref=e54]: 每15秒自动同步修炼进度 · 离线收益自动结算
  - generic:
    - img
  - generic [ref=e55]:
    - button "Toggle Nuxt DevTools" [ref=e56] [cursor=pointer]:
      - img [ref=e57]
    - generic "Page load time" [ref=e60]:
      - generic [ref=e61]: "50"
      - generic [ref=e62]: ms
    - button "Toggle Component Inspector" [ref=e64] [cursor=pointer]:
      - img [ref=e65]
  - generic [ref=e70]:
    - heading "天降机缘" [level=3] [ref=e71]
    - paragraph [ref=e72]: 一道灵光从天而降，直直没入你的天灵盖！你感觉体内灵气暴涨！
    - button "全力吸收 吸收全部灵气" [ref=e74] [cursor=pointer]:
      - text: 全力吸收
      - generic [ref=e75]: 吸收全部灵气
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe.serial('核心用户旅程', () => {
  4  |   const ts = Date.now()
  5  |   const email = `e2e_${ts}@test.com`
  6  |   const pw = 'e2etest123'
  7  | 
  8  |   test('P1: 注册新用户', async ({ page }) => {
  9  |     await page.goto('/register', { waitUntil: 'domcontentloaded' })
  10 |     await page.waitForSelector('input[type="email"]', { timeout: 15000 })
  11 |     await page.fill('input[maxlength="20"]', 'E2E测试')
  12 |     await page.fill('input[type="email"]', email)
  13 |     await page.fill('input[type="password"]', pw)
  14 |     await page.click('button:has-text("踏上修仙路")')
  15 |     await page.waitForURL('/cultivate', { timeout: 10000 })
  16 |     await expect(page.locator('text=E2E测试')).toBeVisible({ timeout: 8000 })
  17 |   })
  18 | 
  19 |   test('P2: 登录已有用户', async ({ page }) => {
  20 |     await page.goto('/', { waitUntil: 'domcontentloaded' })
  21 |     await page.waitForSelector('input[type="email"]', { timeout: 15000 })
  22 |     await page.fill('input[type="email"]', email)
  23 |     await page.fill('input[type="password"]', pw)
  24 |     await page.click('button:has-text("踏入修仙路")')
  25 |     await page.waitForURL('/cultivate', { timeout: 10000 })
  26 |     await expect(page.locator('text=凝气期')).toBeVisible({ timeout: 8000 })
  27 |   })
  28 | 
  29 |   test('P3: 错误登录', async ({ page }) => {
  30 |     await page.goto('/', { waitUntil: 'domcontentloaded' })
  31 |     await page.waitForSelector('input[type="email"]', { timeout: 15000 })
  32 |     await page.fill('input[type="email"]', email)
  33 |     await page.fill('input[type="password"]', 'wrongpassword')
  34 |     await page.click('button:has-text("踏入修仙路")')
  35 |     await expect(page.locator('text=邮箱或密码错误')).toBeVisible({ timeout: 5000 })
  36 |   })
  37 | 
  38 |   test('P4: 页面直接加载', async ({ page }) => {
  39 |     // Login first, then navigate directly via URL to avoid modal intercept
  40 |     await page.goto('/', { waitUntil: 'domcontentloaded' })
  41 |     await page.waitForSelector('input[type="email"]', { timeout: 15000 })
  42 |     await page.fill('input[type="email"]', email)
  43 |     await page.fill('input[type="password"]', pw)
  44 |     await page.click('button:has-text("踏入修仙路")')
  45 |     await page.waitForURL('/cultivate', { timeout: 10000 })
  46 | 
  47 |     // Shop page
  48 |     await page.goto('/shop', { waitUntil: 'domcontentloaded' })
  49 |     await expect(page.locator('text=幽魂草')).toBeVisible({ timeout: 10000 })
  50 | 
  51 |     // Alchemy page
  52 |     await page.goto('/alchemy', { waitUntil: 'domcontentloaded' })
  53 |     await expect(page.locator('text=培元丹')).toBeVisible({ timeout: 10000 })
  54 | 
  55 |     // Rankings
  56 |     await page.goto('/rankings', { waitUntil: 'domcontentloaded' })
  57 |     await expect(page.locator('text=排 行')).toBeVisible({ timeout: 10000 })
  58 |   })
  59 | 
  60 |   test('P5: 每日签到', async ({ page }) => {
  61 |     await page.goto('/', { waitUntil: 'domcontentloaded' })
  62 |     await page.waitForSelector('input[type="email"]', { timeout: 15000 })
  63 |     await page.fill('input[type="email"]', email)
  64 |     await page.fill('input[type="password"]', pw)
  65 |     await page.click('button:has-text("踏入修仙路")')
  66 |     await page.waitForURL('/cultivate', { timeout: 10000 })
  67 | 
  68 |     // Check sign-in card
  69 |     await expect(page.locator('text=每日签到')).toBeVisible({ timeout: 5000 })
  70 |     // May already be signed in, or can sign in
  71 |     const signInBtn = page.locator('button:has-text("签到")')
  72 |     if (await signInBtn.isVisible()) {
> 73 |       await signInBtn.click()
     |                       ^ Error: locator.click: Test timeout of 45000ms exceeded.
  74 |       await expect(page.locator('text=已签到')).toBeVisible({ timeout: 5000 })
  75 |     }
  76 |   })
  77 | })
  78 | 
```