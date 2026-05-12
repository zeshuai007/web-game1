export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  compatibilityDate: '2026-05-12',
  nitro: {
    experimental: {
      openAPI: false,
    },
  },
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'xianni-dev-secret-change-in-production',
    dbConnectionString: process.env.DB_CONNECTION_STRING || 'postgresql://localhost:5433/xianni_game',
  },
  tailwindcss: {
    configPath: 'tailwind.config.ts',
  },
})
