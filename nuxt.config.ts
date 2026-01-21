// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@nuxtjs/supabase",
    "@nuxtjs/i18n",
  ],
  future: {
    compatibilityVersion: 4,
  },
  supabase: {
    redirect: false,
  },
  i18n: {
    locales: [
      { code: "en", name: "English", file: "en.json" },
      { code: "hu", name: "Magyar", file: "hu.json" },
      { code: "sr", name: "Srpski", file: "sr.json" },
    ],
    lazy: true,
    langDir: "../app/locales",
    defaultLocale: "en",
    strategy: "prefix_and_default",
  },
});
