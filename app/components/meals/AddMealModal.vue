<script setup lang="ts">
import type { Database } from "../../types/database.types";

const props = defineProps<{
  isOpen: boolean;
  date: string;
  mealType: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "add", recipeId: string, customName?: string): void;
}>();

const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();
const searchQuery = ref("");
const selectedRecipeId = ref<string | null>(null);

const { data: recipes, refresh } = await useAsyncData(
  "recipes-local-list",
  async () => {
    const userId = user.value?.id || user.value?.sub;
    console.log("Fetching recipes for modal. User ID:", userId);
    if (!userId || userId === "undefined") {
      console.warn("No valid user ID found, returning empty list.");
      return [];
    }

    // Map mealType to category
    let categoryFilter: string | null = null;
    switch (props.mealType) {
      case "breakfast":
        categoryFilter = "Breakfast";
        break;
      case "lunch":
        categoryFilter = "Lunch";
        break;
      case "dinner":
        categoryFilter = "Dinner";
        break;
      case "morning_snack":
      case "afternoon_snack":
      case "evening_snack":
        categoryFilter = "Snack";
        break;
    }

    // Remove user_id filter to show public recipes from all users
    // RLS policies will return: user's own recipes + public recipes from others
    let query = supabase
      .from("recipes")
      .select("id, title, image_url, recipe_categories!inner(category)")
      .order("title");

    // Apply category filter if we have a mapping
    // Include both the specific category AND Dessert category (desserts can be added to any meal)
    if (categoryFilter) {
      query = query.or(`category.eq.${categoryFilter},category.eq.Dessert`, {
        referencedTable: "recipe_categories",
      });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching recipes:", error);
      return [];
    }
    console.log("Fetched recipes:", data?.length);
    return data || [];
  },
  {
    watch: [user],
    server: false,
    lazy: true,
  },
);

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      refresh();
    }
  },
);

// Watch mealType to refresh when opening for different meal types
watch(
  () => props.mealType,
  () => {
    if (props.isOpen) {
      refresh();
    }
  },
);

const filteredRecipes = computed(() => {
  if (!recipes.value) return [];
  if (!searchQuery.value) return recipes.value;
  const lowerQuery = searchQuery.value.toLowerCase();
  return recipes.value.filter((r) =>
    r.title.toLowerCase().includes(lowerQuery),
  );
});

const handleAdd = () => {
  if (selectedRecipeId.value) {
    emit("add", selectedRecipeId.value);
    selectedRecipeId.value = null;
    searchQuery.value = "";
  }
};

const handleClose = () => {
  selectedRecipeId.value = null;
  searchQuery.value = "";
  emit("close");
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
  >
    <div
      class="fixed inset-0 bg-black/50 transition-opacity"
      @click="handleClose"
    ></div>

    <div
      class="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:w-full sm:max-w-lg flex flex-col max-h-[80vh]"
    >
      <!-- Header -->
      <div
        class="px-4 py-4 sm:px-6 border-b border-gray-100 flex justify-between items-center"
      >
        <h3 class="text-lg font-semibold text-gray-900">
          {{ $t("add_meal_title") }}
        </h3>
        <button @click="handleClose" class="text-gray-400 hover:text-gray-500">
          <svg
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="p-4 sm:p-6 flex-1 overflow-y-auto">
        <div class="mb-4">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('search_recipes_placeholder')"
            class="w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
          />
        </div>

        <div class="space-y-2">
          <div
            v-for="recipe in filteredRecipes"
            :key="recipe.id"
            @click="selectedRecipeId = recipe.id"
            :class="[
              selectedRecipeId === recipe.id
                ? 'bg-gray-100 ring-2 ring-black'
                : 'hover:bg-gray-50 border-transparent',
              'cursor-pointer rounded-lg border p-3 flex items-center gap-3 transition-colors',
            ]"
          >
            <img
              v-if="recipe.image_url"
              :src="recipe.image_url"
              alt=""
              class="h-10 w-10 rounded object-cover bg-gray-200"
            />
            <div
              v-else
              class="h-10 w-10 rounded bg-gray-200 flex items-center justify-center text-gray-400"
            >
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div class="flex-1">
              <div class="font-medium text-gray-900">{{ recipe.title }}</div>
              <div class="text-xs text-gray-500 mt-0.5">
                {{
                  recipe.recipe_categories
                    .map((rc) => $t(`category_${rc.category.toLowerCase()}`))
                    .join(", ")
                }}
              </div>
            </div>
          </div>

          <div
            v-if="filteredRecipes.length === 0"
            class="text-center py-8 text-gray-500"
          >
            {{ $t("no_recipes_found") }}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
        <button
          @click="handleAdd"
          :disabled="!selectedRecipeId"
          class="inline-flex w-full justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
        >
          {{ $t("add_meal_button") }}
        </button>
        <button
          @click="handleClose"
          class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
        >
          {{ $t("cancel") }}
        </button>
      </div>
    </div>
  </div>
</template>
