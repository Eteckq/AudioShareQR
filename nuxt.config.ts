// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    // Variables privées (côté serveur uniquement)
    dev: process.env.DEV === 'true',
    // Variables publiques (côté client et serveur)
    public: {
      dev: process.env.DEV === 'true'
    }
  }
})