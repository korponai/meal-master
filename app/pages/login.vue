<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const localePath = useLocalePath();
const { t, setLocale } = useI18n();

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const errorMsg = ref("");

const i18nCookie = useCookie("i18n_redirected", {
  maxAge: 60 * 60 * 24 * 365,
  path: "/",
});

// Redirect if already logged in (but not during login submission flow)
watch(
  user,
  (newUser) => {
    if (newUser && !isLoading.value) {
      navigateTo(localePath("/recipes"));
    }
  },
  { immediate: true },
);

const handleLogin = async () => {
  isLoading.value = true;
  errorMsg.value = "";
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    if (error) throw error;

    // Explicitly handle language preference before navigation
    if (authData.user) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("preferred_language")
          .eq("id", authData.user.id)
          .single();

        if (
          profile?.preferred_language &&
          ["en", "hu", "sr"].includes(profile.preferred_language)
        ) {
          // Update the cookie using the hoisted composable reference (or create one if strictly needed here, but better hoisted)
          // In Nuxt, useCookie is a composable that returns a ref. We should call it at setup.
          // However, we want to SET it.
          // Correct pattern: define const cookie = useCookie(...) at top, then cookie.value = ...
          i18nCookie.value = profile.preferred_language;
          await setLocale(profile.preferred_language as any);
        }
      } catch (langError) {
        console.error(
          "Error fetching language preference on login:",
          langError,
        );
      }
    }

    navigateTo(localePath("/recipes"));
  } catch (error: any) {
    errorMsg.value = error.message;
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <h2 class="mt-6 text-2xl font-bold text-gray-900 mb-8">
      {{ $t("login_title") }}
    </h2>
    <form @submit.prevent="handleLogin" class="space-y-6">
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

      <div class="flex items-center justify-end">
        <NuxtLink
          to="/forgot-password"
          class="text-sm font-medium text-black hover:text-gray-800"
        >
          {{ $t("forgot_password") }}
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
        <span v-if="isLoading">{{ $t("loading") }}</span>
        <span v-else>{{ $t("login") }}</span>
      </button>

      <div class="relative my-8">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-200"></div>
        </div>
      </div>

      <div class="mt-6">
        <p class="text-lg font-bold text-gray-900 mb-6">
          {{ $t("create_account") }}
        </p>
        <NuxtLink
          to="/register"
          class="flex w-full justify-center rounded-xl bg-white border border-black py-3.5 px-4 text-sm font-semibold text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          {{ $t("create_account") }}
        </NuxtLink>
      </div>
    </form>
  </div>
</template>
