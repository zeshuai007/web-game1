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
})
