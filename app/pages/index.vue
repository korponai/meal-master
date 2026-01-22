<script setup lang="ts">
definePageMeta({
  layout: "landing",
});
const { t } = useI18n();
</script>

<template>
  <div class="space-y-6 px-4 md:px-8 max-w-7xl mx-auto pb-20">
    <!-- Hero Section -->
    <section
      class="bg-gray-200 rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden"
    >
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div class="z-10 relative">
          <h1
            class="text-4xl md:text-6xl font-extrabold tracking-tight text-black mb-6 leading-[1.1]"
          >
            {{ $t("hero_title_1") }} <br class="hidden md:block" />
            {{ $t("hero_title_2") }} <br class="hidden md:block" />
            {{ $t("hero_title_3") }}
          </h1>
          <p class="text-lg md:text-xl text-gray-600 mb-10 max-w-lg">
            {{ $t("hero_subtitle") }}
          </p>
          <div class="flex flex-wrap gap-4">
            <NuxtLink
              to="/register"
              class="bg-black text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              {{ $t("get_started") }}
            </NuxtLink>
            <button
              class="border border-black text-black px-8 py-3.5 rounded-xl font-semibold hover:bg-black/5 transition-colors"
            >
              {{ $t("request_demo") }}
            </button>
          </div>
        </div>

        <div class="flex justify-center md:justify-end">
          <!-- Hero Icon (Book) -->
          <div
            class="w-64 h-64 md:w-80 md:h-80 bg-black rounded-3xl flex items-center justify-center text-white shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-32 h-32 md:w-40 md:h-40"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path
                d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
              />
              <line x1="12" x2="16" y1="8" y2="8" />
              <line x1="12" x2="16" y1="12" y2="12" />
              <line x1="8" x2="8.01" y1="8" y2="8" />
              <line x1="8" x2="8.01" y1="12" y2="12" />
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Card 1: Active Users -->
      <div
        class="bg-gray-200 rounded-[2rem] p-8 flex flex-col justify-between h-48 relative overflow-hidden group"
      >
        <span class="text-sm font-medium text-gray-600">{{
          $t("active_users")
        }}</span>
        <div class="flex items-end gap-2">
          <span class="text-4xl font-bold tracking-tight">500K+</span>
        </div>
        <!-- Avatars Placeholder -->
        <div class="absolute bottom-8 right-8 flex -space-x-3">
          <div
            class="w-10 h-10 rounded-full bg-red-400 border-2 border-white"
          ></div>
          <div
            class="w-10 h-10 rounded-full bg-yellow-400 border-2 border-white"
          ></div>
          <div
            class="w-10 h-10 rounded-full bg-teal-400 border-2 border-white"
          ></div>
          <div
            class="w-10 h-10 rounded-full bg-blue-400 border-2 border-white"
          ></div>
        </div>
      </div>

      <!-- Card 2: Recipes Saved -->
      <div
        class="bg-gray-200 rounded-[2rem] p-8 flex flex-col justify-between h-48 relative group"
      >
        <span class="text-sm font-medium text-gray-600">{{
          $t("recipes_saved")
        }}</span>
        <span class="text-4xl font-bold tracking-tight">10K+</span>
        <div class="absolute bottom-6 right-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-12 h-12 text-black"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
          >
            <path
              d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle
              cx="9"
              cy="21"
              r="1"
              stroke="currentColor"
              stroke-width="2"
            />
            <circle
              cx="20"
              cy="21"
              r="1"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </div>
      </div>

      <!-- Card 3: Meals Planned -->
      <div
        class="bg-gray-200 rounded-[2rem] p-8 flex flex-col justify-between h-48 relative group"
      >
        <span class="text-sm font-medium text-gray-600">{{
          $t("meals_planned")
        }}</span>
        <span class="text-4xl font-bold tracking-tight">20K+</span>
        <div class="absolute bottom-6 right-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-12 h-12 text-black"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
          >
            <line
              x1="8"
              y1="6"
              x2="21"
              y2="6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <line
              x1="8"
              y1="12"
              x2="21"
              y2="12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <line
              x1="8"
              y1="18"
              x2="21"
              y2="18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <line
              x1="3"
              y1="6"
              x2="3.01"
              y2="6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <line
              x1="3"
              y1="12"
              x2="3.01"
              y2="12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <line
              x1="3"
              y1="18"
              x2="3.01"
              y2="18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
      </div>

      <!-- Card 4: Donate -->
      <div
        class="bg-gray-200 rounded-[2rem] p-8 flex flex-col justify-between h-48 relative group hover:bg-gray-300 transition-colors cursor-pointer"
      >
        <div class="absolute top-6 right-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-10 h-10 text-black fill-current"
            viewBox="0 0 24 24"
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            />
          </svg>
        </div>
        <div class="mt-auto">
          <span class="text-sm font-medium text-gray-600 block mb-1">{{
            $t("support_us")
          }}</span>
          <span class="text-3xl font-bold tracking-tight">{{
            $t("donate")
          }}</span>
        </div>
      </div>
    </section>
  </div>
</template>
