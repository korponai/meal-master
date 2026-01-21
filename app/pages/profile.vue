<script setup lang="ts">
import AvatarUpload from "~/components/profile/AvatarUpload.vue";
import AccountDetails from "~/components/profile/AccountDetails.vue";
import PasswordChange from "~/components/profile/PasswordChange.vue";

definePageMeta({
  middleware: "auth",
});

const { t } = useI18n();
const avatarUrl = ref("");

const handleAvatarUpdate = () => {
  // Logic to handle post-upload actions if any
};
</script>

<template>
  <ClientOnly>
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <div class="px-4 sm:px-0">
            <h3 class="text-base font-semibold leading-6 text-gray-900">
              {{ t("profile") }}
            </h3>
            <p class="mt-1 text-sm text-gray-600">
              {{ t("profile_description") }}
            </p>
          </div>
        </div>
        <div class="mt-5 md:col-span-2 md:mt-0">
          <div class="shadow sm:overflow-hidden sm:rounded-md">
            <div class="space-y-6 bg-white px-4 py-5 sm:p-6">
              <AvatarUpload
                v-model:path="avatarUrl"
                @upload="handleAvatarUpdate"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="hidden sm:block" aria-hidden="true">
        <div class="py-5">
          <div class="border-t border-gray-200" />
        </div>
      </div>

      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <div class="px-4 sm:px-0">
            <h3 class="text-base font-semibold leading-6 text-gray-900">
              {{ t("account_details") }}
            </h3>
            <p class="mt-1 text-sm text-gray-600">
              {{ t("account_details_description") }}
            </p>
          </div>
        </div>
        <div class="mt-5 md:col-span-2 md:mt-0">
          <div class="shadow sm:overflow-hidden sm:rounded-md">
            <div class="bg-white px-4 py-5 sm:p-6">
              <AccountDetails
                :avatar-url="avatarUrl"
                @update:avatar-url="avatarUrl = $event"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="hidden sm:block" aria-hidden="true">
        <div class="py-5">
          <div class="border-t border-gray-200" />
        </div>
      </div>

      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <div class="px-4 sm:px-0">
            <h3 class="text-base font-semibold leading-6 text-gray-900">
              {{ t("security") }}
            </h3>
            <p class="mt-1 text-sm text-gray-600">
              {{ t("security_description") }}
            </p>
          </div>
        </div>
        <div class="mt-5 md:col-span-2 md:mt-0">
          <div class="shadow sm:overflow-hidden sm:rounded-md">
            <div class="bg-white px-4 py-5 sm:p-6">
              <PasswordChange />
            </div>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>
