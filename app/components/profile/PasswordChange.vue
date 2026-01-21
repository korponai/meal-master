<script setup lang="ts">
const supabase = useSupabaseClient();
const { t } = useI18n();

const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const message = ref("");
const errorMsg = ref("");

const handleUpdatePassword = async () => {
  if (password.value !== confirmPassword.value) {
    errorMsg.value = t("passwords_do_not_match");
    return;
  }

  loading.value = true;
  message.value = "";
  errorMsg.value = "";

  try {
    const { error } = await supabase.auth.updateUser({
      password: password.value,
    });
    if (error) throw error;
    message.value = t("password_updated_successfully");
    password.value = "";
    confirmPassword.value = "";
  } catch (error: any) {
    errorMsg.value = error.message;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <form @submit.prevent="handleUpdatePassword" class="space-y-6">
    <div>
      <label
        for="new-password"
        class="block text-sm font-medium leading-6 text-gray-900"
        >{{ t("new_password") }}</label
      >
      <div class="mt-2">
        <input
          id="new-password"
          v-model="password"
          type="password"
          required
          class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2"
        />
      </div>
    </div>
    <div>
      <label
        for="confirm-password"
        class="block text-sm font-medium leading-6 text-gray-900"
        >{{ t("confirm_password") }}</label
      >
      <div class="mt-2">
        <input
          id="confirm-password"
          v-model="confirmPassword"
          type="password"
          required
          class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2"
        />
      </div>
    </div>

    <div v-if="message" class="text-sm text-green-600">
      {{ message }}
    </div>
    <div v-if="errorMsg" class="text-sm text-red-600">
      {{ errorMsg }}
    </div>

    <div>
      <button
        type="submit"
        :disabled="loading"
        class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
      >
        {{ loading ? t("updating") : t("update_password") }}
      </button>
    </div>
  </form>
</template>
