<script setup lang="ts">
const user = useSupabaseUser();
const supabase = useSupabaseClient();
const router = useRouter();

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push("/login"); // Redirect to login after logout
};
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <h1 class="text-3xl font-bold underline mb-4">Hello Nuxt 4</h1>
    <div v-if="user" class="text-center">
      <p class="mb-4">Logged in as: {{ user.email }}</p>
      <button
        @click="handleLogout"
        class="rounded-md bg-red-600 py-2 px-4 text-sm font-medium text-white hover:bg-red-700"
      >
        Logout
      </button>
    </div>
    <div v-else class="space-x-4">
      <NuxtLink
        to="/login"
        class="text-indigo-600 hover:text-indigo-500 font-medium"
        >Login</NuxtLink
      >
      <NuxtLink
        to="/register"
        class="text-indigo-600 hover:text-indigo-500 font-medium"
        >Register</NuxtLink
      >
    </div>
  </div>
</template>
