export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', '@vite-pwa/nuxt'],
  compatibilityDate: '2026-05-12',
  nitro: {
    preset: 'vercel',
    experimental: {
      openAPI: false,
    },
  },
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || (process.dev ? 'dev-secret-not-for-production' : (() => { throw new Error('JWT_SECRET environment variable is required in production') })()),
    // Never hardcode credentials here — always provide via environment variables.
    dbConnectionString: process.env.DB_CONNECTION_STRING || '',
    pusherEnabled: process.env.PUSHER_ENABLED === '1',
    pusherAppId: process.env.PUSHER_APP_ID || '',
    pusherKey: process.env.PUSHER_KEY || '',
    pusherSecret: process.env.PUSHER_SECRET || '',
    pusherCluster: process.env.PUSHER_CLUSTER || 'ap1',
    public: {
      pusherEnabled: process.env.PUSHER_ENABLED === '1',
      pusherKey: process.env.PUSHER_KEY || '',
      pusherCluster: process.env.PUSHER_CLUSTER || 'ap1',
    },
  },
  vite: {
    optimizeDeps: {
      include: ['pusher-js'],
    },
  },
  tailwindcss: {
    configPath: 'tailwind.config.ts',
  },
  pwa: {
    registerType: 'prompt',
    manifest: {
      name: '仙逆放置修仙',
      short_name: '仙逆',
      description: '仙逆放置修仙 web game',
      lang: 'zh-CN',
      theme_color: '#0d0a07',
      background_color: '#0d0a07',
      display: 'standalone',
      icons: [
        { src: '/images/icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/images/icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/images/icons/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      // 应用壳导航回退；API 一律放行到网络，绝不缓存挂机数据
      navigateFallback: '/',
      navigateFallbackDenylist: [/^\/api\//],
      // 构建产物 precache（图片走运行时缓存，避免首装拉全部背景图）
      globPatterns: ['**/*.{js,css,html,ico,svg}'],
      runtimeCaching: [
        {
          urlPattern: /\/images\/.+\.(webp|png)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'game-images',
            expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            cacheableResponse: { statuses: [200] },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts',
            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
          },
        },
      ],
    },
    devOptions: { enabled: false },
  },
})
