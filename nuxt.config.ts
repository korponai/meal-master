// https://nuxt.com/docs/api/configuration/nuxt-config
import { z } from "zod";

// Environment variable validation schema
const envSchema = z.object({
  CHATGPT_API_KEY: z.string().min(1, "ChatGPT API key is required"),
  CHATGPT_RECIPE_MODEL: z.string().default("gpt-4o-mini"),
  CHATGPT_IMAGE_MODEL: z.string().default("dall-e-3"),
  NUXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NUXT_PUBLIC_SUPABASE_KEY: z
    .string()
    .min(1, "Supabase public key is required"),
  NUXT_PUBLIC_PAYPAL_CLIENT_ID: z.string().optional(),
  NUXT_PUBLIC_ENABLE_NEW_REGISTRATION: z
    .string()
    .optional()
    .transform((val) => val !== "false"),
});

// Validate environment variables at build time
const env = envSchema.parse(process.env);

export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  runtimeConfig: {
    // Server-only (not exposed to client)
    chatgptApiKey: env.CHATGPT_API_KEY,
    chatgptRecipeModel: env.CHATGPT_RECIPE_MODEL,
    chatgptImageModel: env.CHATGPT_IMAGE_MODEL,
    public: {
      supabase: {
        url: env.NUXT_PUBLIC_SUPABASE_URL,
        key: env.NUXT_PUBLIC_SUPABASE_KEY,
      },
      paypalClientId: env.NUXT_PUBLIC_PAYPAL_CLIENT_ID,
      enableNewRegistration: env.NUXT_PUBLIC_ENABLE_NEW_REGISTRATION,
    },
  },
  modules: [
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@nuxtjs/supabase",
    "@nuxtjs/i18n",
    "@nuxtjs/google-fonts",
    "@vite-pwa/nuxt",
    "nuxt-csurf",
  ],

  // CSRF Protection Configuration
  csurf: {
    https: process.env.NODE_ENV === "production",
    cookieKey: "__csrf",
    methodsToProtect: ["POST", "PUT", "PATCH", "DELETE"],
  },

  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "Smart Nutrition",
      short_name: "SmartNutrition",
      description:
        "Your personal nutrition assistant for healthy meal planning and recipes",
      theme_color: "#22c55e",
      background_color: "#ffffff",
      display: "standalone",
      orientation: "portrait",
      scope: "/",
      start_url: "/",
      icons: [
        {
          src: "/icon-64x64.png",
          sizes: "64x64",
          type: "image/png",
        },
        {
          src: "/icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "/icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    workbox: {
      navigateFallback: "/",
      globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2}"],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: "CacheFirst",
          options: {
            cacheName: "google-fonts-cache",
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: "CacheFirst",
          options: {
            cacheName: "gstatic-fonts-cache",
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      type: "module",
    },
  },
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
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
    },
  },
});
