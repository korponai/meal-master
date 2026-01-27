<script setup lang="ts">
import { z } from "zod";

definePageMeta({
  layout: "auth",
});

const supabase = useSupabaseClient();
const { t } = useI18n();
const config = useRuntimeConfig();
const allowRegistration = config.public.enableNewRegistration;
const { showToast } = useToast();

const fullName = ref("");
const email = ref("");
const password = ref("");
const isAgreed = ref(false);
const isLoading = ref(false);
const errorMsg = ref("");

// Zod validation schema
const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  isAgreed: z.boolean().refine((val) => val === true, {
    message: "You must agree to the privacy policy",
  }),
});

const handleRegister = async () => {
  errorMsg.value = "";

  // Validate with Zod
  const validation = registerSchema.safeParse({
    fullName: fullName.value,
    email: email.value,
    password: password.value,
    isAgreed: isAgreed.value,
  });

  if (!validation.success) {
    const firstError = validation.error.issues[0];
    if (firstError) {
      errorMsg.value = firstError.message;
      showToast(firstError.message, "error");
    }
    return;
  }

  isLoading.value = true;
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
    showToast(t("check_email_confirmation"), "success");
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Registration failed";
    errorMsg.value = message;
    showToast(message, "error");
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
    <div
      v-if="!allowRegistration"
      class="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-center text-yellow-800"
    >
      <p class="font-medium">{{ $t("registration_disabled") }}</p>
      <p class="mt-2 text-sm">{{ $t("registration_disabled_desc") }}</p>
      <div class="mt-4">
        <NuxtLink to="/login" class="font-medium text-black hover:underline">
          {{ $t("login_here") }}
        </NuxtLink>
      </div>
    </div>
    <form v-else @submit.prevent="handleRegister" class="space-y-6">
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
          <NuxtLink
            to="/privacy-policy"
            class="font-medium text-black hover:underline"
            target="_blank"
          >
            {{ $t("privacy_policy") }}
          </NuxtLink>
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
