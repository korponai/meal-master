<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const localePath = useLocalePath();

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const errorMsg = ref("");

// Redirect if already logged in
watchEffect(() => {
  if (user.value) {
    navigateTo(localePath("/recipes"));
  }
});

const handleLogin = async () => {
  isLoading.value = true;
  errorMsg.value = "";
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    if (error) throw error;
    // The watchEffect will handle the redirect once user.value is updated
  } catch (error: any) {
    errorMsg.value = error.message;
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <h2 class="mt-6 text-2xl font-bold text-gray-900 mb-8">Login</h2>
    <form @submit.prevent="handleLogin" class="space-y-6">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          class="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-black focus:ring-black sm:text-sm"
          placeholder="name@example.com"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          class="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-black focus:ring-black sm:text-sm"
          placeholder="••••••••"
        />
      </div>

      <div class="flex items-center justify-end">
        <NuxtLink to="/forgot-password" class="text-sm font-medium text-black hover:text-gray-800">
          Forgot Password?
        </NuxtLink>
      </div>

      <div v-if="errorMsg" class="text-sm text-red-600">
        {{ errorMsg }}
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="group relative flex w-full justify-center rounded-xl bg-black py-3.5 px-4 text-sm font-semibold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:bg-gray-400"
      >
        <span v-if="isLoading">Loading...</span>
        <span v-else>Login</span>
      </button>

      <div class="relative my-8">
         <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200"></div>
         </div>
      </div>

      <div class="mt-6">
          <p class="text-lg font-bold text-gray-900 mb-6">Create an Account</p>
           <NuxtLink to="/register" class="flex w-full justify-center rounded-xl bg-white border border-black py-3.5 px-4 text-sm font-semibold text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
            Create an Account
          </NuxtLink>
      </div>
    </form>
  </div>
</template>
