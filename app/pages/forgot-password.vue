<script setup lang="ts">
const supabase = useSupabaseClient();
const email = ref("");
const isLoading = ref(false);
const message = ref("");
const errorMsg = ref("");

const handleResetPassword = async () => {
  isLoading.value = true;
  message.value = "";
  errorMsg.value = "";
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) throw error;
    message.value = "Check your email for the password reset link!";
  } catch (error: any) {
    errorMsg.value = error.message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100">
    <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
      <h2 class="mb-6 text-2xl font-bold text-center text-gray-900">
        Reset Password
      </h2>
      <form @submit.prevent="handleResetPassword" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700"
            >Email</label
          >
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>
        <div v-if="message" class="text-sm text-green-600">
          {{ message }}
        </div>
        <div v-if="errorMsg" class="text-sm text-red-600">
          {{ errorMsg }}
        </div>
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          <span v-if="isLoading">Loading...</span>
          <span v-else>Send Reset Link</span>
        </button>
      </form>
      <div class="mt-4 text-center text-sm">
        <NuxtLink
          to="/login"
          class="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Back to Login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
