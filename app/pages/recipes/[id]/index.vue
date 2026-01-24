<script setup lang="ts">
import { useSupabaseUser } from "#imports";

definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const recipeId = route.params.id as string;

// Fetch recipe with mixed-in ingredient data and user profile for sensitivities
const { data } = await useAsyncData(`recipe-view-${recipeId}`, async () => {
  let currentUserId = user.value?.id;
  if (!currentUserId) {
    const { data: authData } = await supabase.auth.getUser();
    currentUserId = authData.user?.id;
  }

  const [recipeResponse, profileResponse] = await Promise.all([
    supabase
      .from("recipes")
      .select(
        `
                *,
                recipe_ingredients (
                    id,
                    quantity,
                    unit,
                    ingredients (
                        name
                    )
                )
            `,
      )
      .eq("id", recipeId)
      .single(),
    currentUserId
      ? supabase
          .from("profiles")
          .select("food_sensitivities")
          .eq("id", currentUserId)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  return {
    recipe: recipeResponse.data,
    userSensitivities: profileResponse.data?.food_sensitivities || [],
  };
});

const recipe = computed(() => data.value?.recipe);
const userSensitivities = computed(() => data.value?.userSensitivities || []);

const matchingAllergens = computed(() => {
  if (!recipe.value?.allergens || !userSensitivities.value.length) return [];
  return recipe.value.allergens.filter((allergen) =>
    userSensitivities.value
      .map((s) => s.toLowerCase())
      .includes(allergen.toLowerCase()),
  );
});

const handleDelete = async () => {
  if (!confirm("Delete this recipe?")) return;
  await supabase.from("recipes").delete().eq("id", recipeId);
  navigateTo("/recipes");
};

const { t, te } = useI18n();
const getIngredientName = (name: string) => {
  if (!name) return "";
  const key = `ingredient_${name.toLowerCase().replace(/\s+/g, "_")}`;
  return te(key) ? t(key) : name;
};
</script>

<template>
  <div
    v-if="recipe"
    class="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
  >
    <!-- Hero Image - Full Aspect Ratio -->
    <div class="w-full bg-gray-100 flex justify-center">
      <img
        v-if="recipe.image_url"
        :src="recipe.image_url"
        class="max-w-full h-auto object-contain"
        :alt="$t('recipe_image_alt')"
      />
      <div
        v-else
        class="h-64 w-full flex items-center justify-center text-gray-400 bg-gray-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-16 h-16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>

    <div class="p-8 sm:p-12">
      <div
        class="flex flex-col md:flex-row justify-between items-start gap-4 mb-6"
      >
        <div>
          <div class="flex flex-wrap gap-2 mb-3">
            <span
              class="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold uppercase tracking-wide"
            >
              {{
                te("category_" + recipe.category.toLowerCase())
                  ? t("category_" + recipe.category.toLowerCase())
                  : recipe.category
              }}
            </span>
            <!-- Allergens -->
            <template v-if="recipe.allergens && recipe.allergens.length">
              <span
                v-for="allergen in recipe.allergens"
                :key="allergen"
                class="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border"
                :class="
                  matchingAllergens
                    .map((a) => a.toLowerCase())
                    .includes(allergen.toLowerCase())
                    ? 'bg-red-200 text-red-800 border-red-300 font-bold'
                    : 'bg-white text-gray-600 border-gray-200'
                "
              >
                {{
                  te("sensitivity_" + allergen.toLowerCase())
                    ? t("sensitivity_" + allergen.toLowerCase())
                    : allergen
                }}
                <span
                  v-if="
                    matchingAllergens
                      .map((a) => a.toLowerCase())
                      .includes(allergen.toLowerCase())
                  "
                  class="ml-1"
                  >⚠️</span
                >
              </span>
            </template>
          </div>
          <h1 class="text-4xl font-bold text-gray-900">{{ recipe.title }}</h1>
        </div>
        <div class="flex gap-2 shrink-0">
          <NuxtLink
            :to="`/recipes/${recipe.id}/edit`"
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
            >{{ $t("edit") }}</NuxtLink
          >
          <button
            @click="handleDelete"
            class="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium hover:bg-red-100"
          >
            {{ $t("delete") }}
          </button>
        </div>
      </div>

      <p
        class="text-gray-600 text-lg leading-relaxed mb-8 border-b border-gray-100 pb-8"
      >
        {{ recipe.description }}
      </p>

      <div class="grid md:grid-cols-3 gap-12">
        <div class="md:col-span-1">
          <h3 class="font-bold text-xl mb-4">{{ $t("ingredients_label") }}</h3>
          <ul
            v-if="recipe.recipe_ingredients && recipe.recipe_ingredients.length"
            class="space-y-3"
          >
            <li
              v-for="item in recipe.recipe_ingredients"
              :key="item.id"
              class="flex items-start gap-3 text-gray-700 pb-2 border-b border-gray-50 last:border-0"
            >
              <div
                class="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0"
              ></div>
              <span>
                <span class="font-semibold"
                  >{{ item.quantity }} {{ $t(`unit_${item.unit}`) }}</span
                >
                <span class="text-gray-600 ml-1">{{
                  item.ingredients?.name
                }}</span>
              </span>
            </li>
          </ul>
          <div v-else class="text-gray-400 italic">
            {{ $t("ingredients_not_structured") }}
          </div>
        </div>
        <div class="md:col-span-2">
          <h3 class="font-bold text-xl mb-4">
            {{ $t("recipe_experience_label") }}
          </h3>
          <div class="prose max-w-none text-gray-700 whitespace-pre-line">
            {{
              recipe.experience ||
              recipe.instructions ||
              $t("no_experience_details")
            }}
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-20">
    <p class="text-gray-500">{{ $t("loading_recipe") }}</p>
  </div>
</template>
