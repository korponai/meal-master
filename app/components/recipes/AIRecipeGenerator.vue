<script setup lang="ts">
import type { Database } from "@/types/database.types";
import { ALL_SENSITIVITIES } from "@/utils/constants";

interface GeneratedRecipe {
  title: string;
  description: string;
  category: "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Dessert";
  ingredients: { name: string; quantity: number; unit: string }[];
  allergens: string[];
}

const emit = defineEmits<{
  (e: "save", recipe: GeneratedRecipe, imageUrl: string | null): void;
}>();

const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();
const { t } = useI18n();

// State
const customFocus = ref("");
const isGeneratingRecipe = ref(false);
const isGeneratingImage = ref(false);
const generatedRecipe = ref<GeneratedRecipe | null>(null);
const generatedImageUrl = ref<string | null>(null);
const error = ref<string | null>(null);

// Fetch user sensitivities
const { data: userProfile } = useAsyncData("user-profile-ai", async () => {
  let currentUserId = user.value?.id;

  if (!currentUserId) {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user?.id) {
      currentUserId = authData.user.id;
    }
  }

  if (!currentUserId) return null;

  const { data } = await supabase
    .from("profiles")
    .select("food_sensitivities")
    .eq("id", currentUserId)
    .single();

  return data;
});

const userSensitivities = computed(
  () => userProfile.value?.food_sensitivities || [],
);

// Generate recipe
const generateRecipe = async () => {
  error.value = null;
  isGeneratingRecipe.value = true;
  generatedRecipe.value = null;

  try {
    const { data, error: fetchError } = await useFetch<{
      recipe: GeneratedRecipe;
    }>("/api/ai/generate-recipe", {
      method: "POST",
      body: {
        sensitivities: userSensitivities.value,
        customFocus: customFocus.value || undefined,
      },
    });

    if (fetchError.value) {
      throw new Error(fetchError.value.message || "Failed to generate recipe");
    }

    if (data.value?.recipe) {
      generatedRecipe.value = data.value.recipe;
    }
  } catch (e: any) {
    console.error("Recipe generation error:", e);
    error.value = e.message || t("ai_error");
  } finally {
    isGeneratingRecipe.value = false;
  }
};

// Generate image
const generateImage = async () => {
  if (!generatedRecipe.value) return;

  error.value = null;
  isGeneratingImage.value = true;

  try {
    const { data, error: fetchError } = await useFetch<{ url: string }>(
      "/api/ai/generate-recipe-image",
      {
        method: "POST",
        body: {
          recipeTitle: generatedRecipe.value.title,
        },
      },
    );

    if (fetchError.value) {
      throw new Error(fetchError.value.message || "Failed to generate image");
    }

    if (data.value?.url) {
      generatedImageUrl.value = data.value.url;
    }
  } catch (e: any) {
    console.error("Image generation error:", e);
    error.value = e.message || t("ai_error");
  } finally {
    isGeneratingImage.value = false;
  }
};

// Save recipe
const saveRecipe = () => {
  if (!generatedRecipe.value) return;
  emit("save", generatedRecipe.value, generatedImageUrl.value);
};

// Reset
const resetGeneration = () => {
  generatedRecipe.value = null;
  generatedImageUrl.value = null;
  error.value = null;
};
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center">
      <h2
        class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
      >
        ✨ {{ $t("ai_generate_recipe") }}
      </h2>
      <p class="mt-2 text-gray-600">
        {{ $t("ai_generate_description") }}
      </p>
    </div>

    <!-- Sensitivities Notice -->
    <div
      v-if="userSensitivities.length > 0"
      class="bg-amber-50 border border-amber-200 rounded-xl p-4"
    >
      <div class="flex items-start gap-3">
        <span class="text-amber-500 text-xl">⚠️</span>
        <div>
          <p class="font-medium text-amber-800">
            {{ $t("sensitivities_applied") }}
          </p>
          <div class="flex flex-wrap gap-2 mt-2">
            <span
              v-for="sensitivity in userSensitivities"
              :key="sensitivity"
              class="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full"
            >
              {{ $t("sensitivity_" + sensitivity) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Focus Input -->
    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">
        {{ $t("ai_custom_prompt") }}
      </label>
      <input
        v-model="customFocus"
        type="text"
        :placeholder="$t('ai_custom_prompt_placeholder')"
        class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4"
        :disabled="isGeneratingRecipe"
      />
    </div>

    <!-- Generate Button -->
    <div v-if="!generatedRecipe" class="flex justify-center">
      <button
        @click="generateRecipe"
        :disabled="isGeneratingRecipe"
        class="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        <svg
          v-if="isGeneratingRecipe"
          class="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span v-else>✨</span>
        {{
          isGeneratingRecipe ? $t("generating_recipe") : $t("generate_recipe")
        }}
      </button>
    </div>

    <!-- Error Message -->
    <div
      v-if="error"
      class="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700"
    >
      {{ error }}
    </div>

    <!-- Generated Recipe Preview -->
    <div
      v-if="generatedRecipe"
      class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
    >
      <div class="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
        <h3 class="text-lg font-semibold text-white">
          {{ $t("ai_preview") }}
        </h3>
      </div>

      <div class="p-6 space-y-6">
        <!-- Recipe Image -->
        <div class="flex justify-center">
          <div
            v-if="generatedImageUrl"
            class="relative w-64 h-64 rounded-xl overflow-hidden shadow-md"
          >
            <img
              :src="generatedImageUrl"
              :alt="generatedRecipe.title"
              class="w-full h-full object-cover"
            />
          </div>
          <div
            v-else
            class="w-64 h-64 rounded-xl bg-gray-100 flex flex-col items-center justify-center border-2 border-dashed border-gray-300"
          >
            <button
              @click="generateImage"
              :disabled="isGeneratingImage"
              class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <svg
                v-if="isGeneratingImage"
                class="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{
                isGeneratingImage
                  ? $t("generating_image")
                  : $t("generate_image")
              }}
            </button>
          </div>
        </div>

        <!-- Title & Category -->
        <div>
          <h4 class="text-2xl font-bold text-gray-900">
            {{ generatedRecipe.title }}
          </h4>
          <span
            class="inline-block mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full"
          >
            {{ $t("category_" + generatedRecipe.category.toLowerCase()) }}
          </span>
        </div>

        <!-- Description -->
        <p class="text-gray-600 leading-relaxed">
          {{ generatedRecipe.description }}
        </p>

        <!-- Ingredients -->
        <div>
          <h5 class="font-semibold text-gray-900 mb-3">
            {{ $t("ingredients_label") }}
          </h5>
          <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li
              v-for="(ing, idx) in generatedRecipe.ingredients"
              :key="idx"
              class="flex items-center gap-2 text-gray-600"
            >
              <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
              {{ ing.quantity }} {{ $t("unit_" + ing.unit) }} {{ ing.name }}
            </li>
          </ul>
        </div>

        <!-- Allergens -->
        <div v-if="generatedRecipe.allergens?.length">
          <h5 class="font-semibold text-gray-900 mb-3">
            {{ $t("allergens_label") }}
          </h5>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="allergen in generatedRecipe.allergens"
              :key="allergen"
              class="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full"
            >
              {{ $t("sensitivity_" + allergen) }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div
          class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100"
        >
          <button
            @click="saveRecipe"
            class="flex-1 inline-flex justify-center items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
          >
            ✓ {{ $t("save_and_edit") }}
          </button>
          <button
            @click="resetGeneration"
            class="flex-1 inline-flex justify-center items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            🔄 {{ $t("regenerate") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
