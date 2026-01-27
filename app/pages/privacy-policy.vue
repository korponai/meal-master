<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const { t } = useI18n();
</script>

<template>
  <div class="max-w-4xl mx-auto py-10 px-4">
    <h1 class="text-4xl font-bold text-gray-900 mb-8">
      {{ $t("privacy_policy") }}
    </h1>

    <div class="prose prose-gray max-w-none space-y-6">
      <section>
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">
          1. {{ $t("privacy_introduction") }}
        </h2>
        <p class="text-gray-700 leading-relaxed">
          {{ $t("privacy_intro_text") }}
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">
          2. {{ $t("privacy_data_collection") }}
        </h2>
        <p class="text-gray-700 leading-relaxed mb-3">
          {{ $t("privacy_data_collection_text") }}
        </p>
        <ul class="list-disc list-inside text-gray-700 space-y-2 ml-4">
          <li>{{ $t("privacy_data_account") }}</li>
          <li>{{ $t("privacy_data_recipes") }}</li>
          <li>{{ $t("privacy_data_meal_plans") }}</li>
          <li>{{ $t("privacy_data_preferences") }}</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">
          3. {{ $t("privacy_data_usage") }}
        </h2>
        <p class="text-gray-700 leading-relaxed mb-3">
          {{ $t("privacy_data_usage_text") }}
        </p>
        <ul class="list-disc list-inside text-gray-700 space-y-2 ml-4">
          <li>{{ $t("privacy_usage_service") }}</li>
          <li>{{ $t("privacy_usage_personalization") }}</li>
          <li>{{ $t("privacy_usage_improvement") }}</li>
          <li>{{ $t("privacy_usage_communication") }}</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">
          4. {{ $t("privacy_data_storage") }}
        </h2>
        <p class="text-gray-700 leading-relaxed">
          {{ $t("privacy_storage_text") }}
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">
          5. {{ $t("privacy_third_party") }}
        </h2>
        <p class="text-gray-700 leading-relaxed mb-3">
          {{ $t("privacy_third_party_text") }}
        </p>
        <ul class="list-disc list-inside text-gray-700 space-y-2 ml-4">
          <li>{{ $t("privacy_third_party_auth") }}</li>
          <li>{{ $t("privacy_third_party_ai") }}</li>
          <li>{{ $t("privacy_third_party_payments") }}</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">
          6. {{ $t("privacy_user_rights") }}
        </h2>
        <p class="text-gray-700 leading-relaxed mb-3">
          {{ $t("privacy_rights_text") }}
        </p>
        <ul class="list-disc list-inside text-gray-700 space-y-2 ml-4">
          <li>{{ $t("privacy_right_access") }}</li>
          <li>{{ $t("privacy_right_rectification") }}</li>
          <li>{{ $t("privacy_right_erasure") }}</li>
          <li>{{ $t("privacy_right_portability") }}</li>
          <li>{{ $t("privacy_right_object") }}</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">
          7. {{ $t("privacy_cookies") }}
        </h2>
        <p class="text-gray-700 leading-relaxed">
          {{ $t("privacy_cookies_text") }}
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">
          8. {{ $t("privacy_changes") }}
        </h2>
        <p class="text-gray-700 leading-relaxed">
          {{ $t("privacy_changes_text") }}
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">
          9. {{ $t("privacy_contact") }}
        </h2>
        <p class="text-gray-700 leading-relaxed">
          {{ $t("privacy_contact_text") }}
        </p>
      </section>

      <section class="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-8">
        <p class="text-sm text-gray-600">
          <strong>{{ $t("privacy_last_updated") }}:</strong> January 27, 2026
        </p>
      </section>
    </div>
  </div>
</template>
