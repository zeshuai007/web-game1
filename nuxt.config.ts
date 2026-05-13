export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  compatibilityDate: '2026-05-12',
  nitro: {
    preset: 'vercel',
    experimental: {
      openAPI: false,
    },
  },
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'xianni-dev-secret-change-in-production',
    dbConnectionString: process.env.DB_CONNECTION_STRING || 'postgresql://localhost:5433/xianni_game',
    pusherEnabled: process.env.PUSHER_ENABLED === '1',
    pusherAppId: process.env.PUSHER_APP_ID || 'test-app',
    pusherKey: process.env.PUSHER_KEY || 'test-key',
    pusherSecret: process.env.PUSHER_SECRET || 'test-secret',
    pusherCluster: process.env.PUSHER_CLUSTER || 'ap1',
    public: {
      pusherEnabled: process.env.PUSHER_ENABLED === '1',
      pusherKey: process.env.PUSHER_KEY || '',
      pusherCluster: process.env.PUSHER_CLUSTER || 'ap1',
    },
  },
  tailwindcss: {
    configPath: 'tailwind.config.ts',
  },
})
