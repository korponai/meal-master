<script setup lang="ts">
const supabase = useSupabaseClient();
const router = useRouter();

const password = ref("");
const confirmPassword = ref("");
const isLoading = ref(false);
const message = ref("");
const errorMsg = ref("");

const handleUpdatePassword = async () => {
  if (password.value !== confirmPassword.value) {
    errorMsg.value = "Passwords do not match";
    return;
  }

  isLoading.value = true;
  message.value = "";
  errorMsg.value = "";

  try {
    const { error } = await supabase.auth.updateUser({
      password: password.value,
    });
    if (error) throw error;
    message.value = "Password updated successfully! Redirecting to home...";
    setTimeout(() => {
      router.push("/");
    }, 2000);
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
        Update Password
      </h2>
      <form @submit.prevent="handleUpdatePassword" class="space-y-4">
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700"
            >New Password</label
          >
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>
        <div>
          <label
            for="confirmPassword"
            class="block text-sm font-medium text-gray-700"
            >Confirm Password</label
          >
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
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
          <span v-if="isLoading">Updating...</span>
          <span v-else>Update Password</span>
        </button>
      </form>
    </div>
  </div>
</template>
