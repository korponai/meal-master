<script setup lang="ts">
const { locale, setLocale } = useI18n();
const localePath = useLocalePath();
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Top Navigation -->
    <header class="border-b border-gray-200">
      <nav
        class="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div class="flex lg:flex-1">
          <NuxtLink :to="localePath('/')" class="-m-1.5 p-1.5">
            <span class="text-xl font-bold tracking-tight text-indigo-600">{{
              $t("smart_nutrition")
            }}</span>
          </NuxtLink>
        </div>
        <div class="flex gap-x-12">
          <NuxtLink
            :to="localePath('/')"
            class="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition-colors"
            >{{ $t("home") }}</NuxtLink
          >
          <NuxtLink
            :to="localePath('/profile')"
            class="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition-colors"
            >{{ $t("profile") }}</NuxtLink
          >
        </div>
        <div class="hidden lg:flex lg:flex-1 lg:justify-end gap-4 items-center">
          <button
            @click="setLocale('en')"
            :class="{ 'font-bold': locale === 'en' }"
            title="English"
          >
            🇬🇧
          </button>
          <button
            @click="setLocale('hu')"
            :class="{ 'font-bold': locale === 'hu' }"
            title="Magyar"
          >
            🇭🇺
          </button>
          <button
            @click="setLocale('sr')"
            :class="{ 'font-bold': locale === 'sr' }"
            title="Srpski"
          >
            🇷🇸
          </button>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main>
      <slot />
    </main>
  </div>
</template>
