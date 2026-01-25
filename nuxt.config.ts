// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  runtimeConfig: {
    // Server-only (not exposed to client)
    chatgptApiKey: process.env.CHATGPT_API_KEY,
    chatgptRecipeModel: process.env.CHATGPT_RECIPE_MODEL || "gpt-4o-mini",
    chatgptImageModel: process.env.CHATGPT_IMAGE_MODEL || "dall-e-3",
    public: {
      supabase: {
        url: process.env.NUXT_PUBLIC_SUPABASE_URL,
        key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
      },
      paypalClientId: process.env.NUXT_PUBLIC_PAYPAL_CLIENT_ID,
      enableNewRegistration:
        process.env.NUXT_PUBLIC_ENABLE_NEW_REGISTRATION !== "false",
    },
  },
  modules: [
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@nuxtjs/supabase",
    "@nuxtjs/i18n",
    "@nuxtjs/google-fonts",
  ],
  css: ["~/assets/css/main.css"],
  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700],
    },
    display: "swap",
  },
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
    langDir: "../app/locales",
    defaultLocale: "en",
    strategy: "prefix_and_default",
  },
});
