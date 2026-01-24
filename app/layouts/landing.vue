<script setup lang="ts">
const route = useRoute();
const user = useSupabaseUser();
</script>

<template>
  <div class="min-h-screen bg-background text-foreground font-sans">
    <!-- Header -->
    <header
      class="py-6 px-4 md:px-8 max-w-7xl mx-auto flex items-center justify-between"
    >
      <div class="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="w-6 h-6"
        >
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
          <path d="M7 2v20" />
          <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
        <span class="font-bold text-xl tracking-tight">MealMaster</span>
      </div>

      <nav
        class="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600"
      >
        <!-- Menu items removed as requested -->
      </nav>

      <div>
        <NuxtLink
          v-if="user"
          to="/recipes"
          class="bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Dashboard
        </NuxtLink>
        <NuxtLink
          v-else
          to="/login"
          class="bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Log in
        </NuxtLink>
      </div>
    </header>

    <main>
      <slot />
    </main>

    <footer class="py-12 px-4 md:px-8 max-w-7xl mx-auto mt-20">
      <div class="flex flex-col md:flex-row justify-between items-start">
        <div class="mb-8 md:mb-0">
          <div class="flex items-center gap-2 mb-4">
            <!-- Logo text only as per mock footer -->
            <span class="font-bold text-2xl tracking-tight">MealMaster</span>
          </div>
        </div>

        <div class="flex flex-col gap-4 text-sm text-gray-600">
          <NuxtLink to="/contact" class="hover:text-black">Contact Us</NuxtLink>
        </div>
      </div>
    </footer>
    <DonationModal />
  </div>
</template>
