<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const supabase = useSupabaseClient();
const { t } = useI18n();

const fullName = ref("");
const email = ref("");
const password = ref("");
const isAgreed = ref(false);
const isLoading = ref(false);
const errorMsg = ref("");

const handleRegister = async () => {
  if (!isAgreed.value) {
    errorMsg.value = t("must_agree_privacy");
    return;
  }

  isLoading.value = true;
  errorMsg.value = "";
  try {
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          full_name: fullName.value,
        },
      },
    });
    if (error) throw error;
    alert(t("check_email_confirmation"));
  } catch (error: any) {
    errorMsg.value = error.message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <h2 class="mt-6 text-2xl font-bold text-gray-900 mb-8">
      {{ $t("register_title") }}
    </h2>
    <form @submit.prevent="handleRegister" class="space-y-6">
      <div>
        <label
          for="fullName"
          class="block text-sm font-medium text-gray-700 mb-2"
          >{{ $t("full_name") }}</label
        >
        <input
          id="fullName"
          v-model="fullName"
          type="text"
          required
          class="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-black focus:ring-black sm:text-sm"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label
          for="email"
          class="block text-sm font-medium text-gray-700 mb-2"
          >{{ $t("email") }}</label
        >
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
        <label
          for="password"
          class="block text-sm font-medium text-gray-700 mb-2"
          >{{ $t("password") }}</label
        >
        <input
          id="password"
          v-model="password"
          type="password"
          required
          class="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-black focus:ring-black sm:text-sm"
          placeholder="••••••••"
        />
      </div>

      <div class="flex items-center">
        <input
          id="terms"
          v-model="isAgreed"
          name="terms"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
        />
        <label for="terms" class="ml-2 block text-sm text-gray-900">
          {{ $t("agree_prefix") }}
          <a href="#" class="font-medium text-black hover:underline">{{
            $t("privacy_policy")
          }}</a>
        </label>
      </div>

      <div v-if="errorMsg" class="text-sm text-red-600">
        {{ errorMsg }}
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="group relative flex w-full justify-center rounded-xl bg-black py-3.5 px-4 text-sm font-semibold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:bg-gray-400"
      >
        <span v-if="isLoading">{{ $t("loading") }}</span>
        <span v-else>{{ $t("register_button") }}</span>
      </button>

      <p class="mt-4 text-center text-sm text-gray-600">
        {{ $t("already_have_account") }}
        <NuxtLink to="/login" class="font-medium text-black hover:underline">
          {{ $t("login_here") }}
        </NuxtLink>
      </p>
    </form>
  </div>
</template>
