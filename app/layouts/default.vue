<script setup lang="ts">
const { locale, setLocale } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const user = useSupabaseUser();
const supabase = useSupabaseClient();

const isActive = (path: string) => route.path.startsWith(path);

const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigateTo("/login");
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Top Navigation -->
    <header class="bg-white border-b border-gray-200">
      <nav class="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
            <span class="font-bold text-lg tracking-tight">MealMaster</span>
        </div>

         <!-- Desktop Nav -->
        <div class="hidden md:flex gap-8 text-sm font-medium text-gray-600">
          <NuxtLink :to="localePath('/')" :class="[isActive('/') && route.path === '/' ? 'text-black' : 'hover:text-black transition-colors']">Home</NuxtLink>
          <template v-if="user">
            <NuxtLink :to="localePath('/meals/weekly-meal-plan')" :class="[isActive('/meals/weekly-meal-plan') ? 'text-black' : 'hover:text-black transition-colors']">Meal Plan</NuxtLink>
            <NuxtLink :to="localePath('/recipes')" :class="[isActive('/recipes') ? 'text-black' : 'hover:text-black transition-colors']">Recipes</NuxtLink>
            <NuxtLink :to="localePath('/meals/shoppinglist')" :class="[isActive('/meals/shoppinglist') ? 'text-black' : 'hover:text-black transition-colors']">Shopping List</NuxtLink>
          </template>
        </div>

        <!-- Right Side / Mobile Menu toggle -->
         <div class="flex items-center gap-4">
             <template v-if="!user">
                <NuxtLink to="/login" class="text-sm font-medium text-gray-900 hover:text-black">Log in</NuxtLink>
                <NuxtLink to="/register" class="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">Sign up</NuxtLink>
             </template>
             <div v-else class="flex items-center gap-4">
                 <NuxtLink :to="localePath('/profile')" :class="[isActive('/profile') ? 'text-black font-bold' : 'text-gray-600 hover:text-black']" class="text-sm font-medium">Profile</NuxtLink>
                 <button @click="handleSignOut" class="text-sm font-medium text-gray-500 hover:text-black">Sign out</button>
             </div>

             <!-- Locale Switcher (Minimal) -->
             <div class="hidden lg:flex gap-2 text-xs ml-4">
                <button @click="setLocale('en')" :class="{'font-bold text-black': locale === 'en', 'text-gray-400': locale !== 'en'}">EN</button>
                <span class="text-gray-300">|</span>
                <button @click="setLocale('hu')" :class="{'font-bold text-black': locale === 'hu', 'text-gray-400': locale !== 'hu'}">HU</button>
             </div>
         </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="flex-grow">
      <div class="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <slot />
      </div>
    </main>

    <!-- Footer Simple -->
    <footer class="bg-gray-900 text-white py-8 mt-auto">
        <div class="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <span class="font-bold text-white mb-4 md:mb-0">MealMaster</span>
            <div class="flex gap-6">
                <a href="#" class="hover:text-white">About Us</a>
                <a href="#" class="hover:text-white">Contact</a>
                <a href="#" class="hover:text-white">Privacy Policy</a>
            </div>
            <span class="mt-4 md:mt-0 text-xs">Your ultimate recipe collection platform.</span>
        </div>
    </footer>
  </div>
</template>
