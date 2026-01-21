<template>
  <div class="min-h-screen bg-white">
    <!-- Top Navigation -->
    <header class="border-b border-gray-200">
      <nav class="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div class="flex lg:flex-1">
          <NuxtLink to="/" class="-m-1.5 p-1.5">
            <span class="text-xl font-bold tracking-tight text-indigo-600">Smart Nutrition</span>
          </NuxtLink>
        </div>
        <div class="flex gap-x-12">
          <NuxtLink to="/" class="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition-colors">Home</NuxtLink>
        </div>
        <div class="hidden lg:flex lg:flex-1 lg:justify-end">
          <!-- Placeholder for future auth/actions -->
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main>
      <slot />
    </main>
  </div>
</template>
