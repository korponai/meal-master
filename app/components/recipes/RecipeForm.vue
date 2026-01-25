<script setup lang="ts">
import { z } from "zod";
import type { Database } from "@/types/database.types";
import type { RecipeIngredient } from "./RecipeIngredientRow.vue";
import RecipesRecipeIngredientRow from "./RecipeIngredientRow.vue"; // Explicit import if auto-import fails or for clarity
import { ALL_SENSITIVITIES } from "@/utils/constants";

const categories = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;
const visibilities = ["public", "private"] as const;

// Zod Schema
const ingredientSchema = z
  .object({
    ingredient: z.object({ id: z.string(), name: z.string() }).nullable(),
    quantity: z.number().min(0, "Quantity must be positive"),
    unit: z.string().min(1, "Unit is required"),
  })
  .refine((data) => data.ingredient !== null, {
    message: "Ingredient is required",
    path: ["ingredient"],
  });

interface NutritionValue {
  value: number | null;
  unit: string;
}

interface NutritionData {
  calories?: NutritionValue;
  protein?: NutritionValue;
  carbohydrates?: NutritionValue;
  fat?: NutritionValue;
  water?: NutritionValue;
  cholesterol?: NutritionValue;
  dietaryFiber?: NutritionValue;
  sugar?: NutritionValue;
}

const recipeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categories: z.array(z.enum(categories)).min(1, "categories_required_error"),
  visibility: z.enum(visibilities),
  experience: z.string().optional(),
  allergens: z.array(z.string()).optional(),
  nutrients: z.any().optional(),
});

// Emits
const emit = defineEmits<{
  (
    e: "submit",
    payload: {
      recipe: z.infer<typeof recipeSchema> & { nutrients?: NutritionData };
      ingredients: RecipeIngredient[];
      imageFile: File | null;
    },
  ): void;
}>();

const props = defineProps<{
  isLoading?: boolean;
  initialData?: any;
}>();

// State
const form = reactive({
  title: "",
  description: "",
  categories: [] as (typeof categories)[number][],
  visibility: "public" as (typeof visibilities)[number],
  experience: "",
  allergens: [] as string[],
  nutrients: null as NutritionData | null,
});

const isGeneratingNutrients = ref(false);
const nutrientsError = ref<string | null>(null);

const ingredients = ref<RecipeIngredient[]>([
  { ingredient: null, quantity: null, unit: "gram" },
]);

const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const errors = ref<Record<string, string>>({});

// Fetch user profile for sensitivity conflict detection
const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();

const { data: userProfile, refresh: refreshProfile } = useAsyncData(
  "user-profile-recipes",
  async () => {
    let currentUserId = user.value?.id;

    // Fallback: Try fetching user directly if ref is empty
    if (!currentUserId) {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.id) {
        currentUserId = authData.user.id;
      }
    }

    if (!currentUserId) {
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("food_sensitivities")
      .eq("id", currentUserId)
      .single();

    if (error) {
      console.error("RecipeForm: Error fetching profile", error);
    }

    return data;
  },
  {
    watch: [user],
    lazy: true,
  },
);

onMounted(async () => {
  // Wait a tick to allow auth state to settle if needed, then refresh
  await nextTick();
  refreshProfile();
});

const isSensitiveTo = (allergen: string) => {
  return userProfile.value?.food_sensitivities?.includes(allergen);
};

const toggleAllergen = (allergen: string) => {
  const idx = form.allergens.indexOf(allergen);
  if (idx === -1) {
    form.allergens.push(allergen);
  } else {
    form.allergens.splice(idx, 1);
  }
};

// Watch initialData to populate form
const toggleCategory = (category: (typeof categories)[number]) => {
  const idx = form.categories.indexOf(category);
  if (idx === -1) {
    form.categories.push(category);
  } else {
    form.categories.splice(idx, 1);
  }
};

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.title = newData.title || "";
      form.description = newData.description || "";
      // Handle categories from recipe_categories relation
      if (Array.isArray(newData.recipe_categories)) {
        form.categories = newData.recipe_categories.map(
          (rc: any) => rc.category,
        );
      } else {
        form.categories = [];
      }
      form.visibility = newData.visibility || "public";
      form.experience = newData.experience || "";
      form.allergens = newData.allergens || [];
      form.nutrients = newData.nutrients || null;

      if (newData.image_url) {
        imagePreview.value = newData.image_url;
      }

      if (
        Array.isArray(newData.recipe_ingredients) &&
        newData.recipe_ingredients.length > 0
      ) {
        ingredients.value = newData.recipe_ingredients.map((ri: any) => ({
          ingredient: ri.ingredients,
          quantity: Number(ri.quantity),
          unit: ri.unit,
        }));
      }
    }
  },
  { immediate: true },
);

// Methods
const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    imageFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

const addIngredient = () => {
  ingredients.value.push({ ingredient: null, quantity: null, unit: "gram" });
};

const removeIngredient = (index: number) => {
  if (ingredients.value.length > 1) {
    ingredients.value.splice(index, 1);
  }
};

const validate = () => {
  errors.value = {};

  // Validate Recipe Fields
  const result = recipeSchema.safeParse(form);
  if (!result.success) {
    result.error.issues.forEach((err) => {
      if (err.path[0]) errors.value[err.path[0].toString()] = err.message;
    });
  }

  // Validate Ingredients
  let hasIngredientErrors = false;
  ingredients.value.forEach((ing, idx) => {
    const ingResult = ingredientSchema.safeParse(ing);
    if (!ingResult.success) {
      hasIngredientErrors = true;
      // Ideally show error per row, simpler for now:
      errors.value["ingredients"] =
        "Please ensure all ingredients have a name, quantity, and unit.";
    }
  });
  if (ingredients.value.length === 0) {
    errors.value["ingredients"] = "At least one ingredient is required.";
    hasIngredientErrors = true;
  }

  return result.success && !hasIngredientErrors;
};

const generateNutrients = async () => {
  // Validate that we have title and ingredients
  if (!form.title || form.title.length < 3) {
    nutrientsError.value = "Please enter a recipe title first";
    return;
  }

  const validIngredients = ingredients.value.filter(
    (ing) => ing.ingredient && ing.quantity && ing.unit,
  );

  if (validIngredients.length === 0) {
    nutrientsError.value = "Please add ingredients first";
    return;
  }

  isGeneratingNutrients.value = true;
  nutrientsError.value = null;

  try {
    const response = await $fetch<{ nutrition: NutritionData }>(
      "/api/ai/generate-nutrients",
      {
        method: "POST",
        body: {
          recipeTitle: form.title,
          ingredients: validIngredients.map((ing) => ({
            name: ing.ingredient!.name,
            quantity: ing.quantity,
            unit: ing.unit,
          })),
          servingSize: 1,
        },
      },
    );

    if (response.nutrition) {
      form.nutrients = response.nutrition;
    }
  } catch (error: any) {
    console.error("Error generating nutrients:", error);
    nutrientsError.value = error.message || "Failed to generate nutrients";
  } finally {
    isGeneratingNutrients.value = false;
  }
};

const isGeneratingImage = ref(false);
const imageGenerationError = ref<string | null>(null);

const generateImage = async () => {
  if (!form.title || form.title.length < 3) {
    imageGenerationError.value = "Please enter a recipe title first";
    return;
  }

  isGeneratingImage.value = true;
  imageGenerationError.value = null;

  try {
    // 1. Generate Image URL
    const { url: generatedUrl } = await $fetch<{ url: string }>(
      "/api/ai/generate-recipe-image",
      {
        method: "POST",
        body: { recipeTitle: form.title },
      },
    );

    // 2. Proxy Image to get Blob/File (avoids CORS and allows upload)
    const { base64, contentType } = await $fetch<{
      base64: string;
      contentType: string;
    }>("/api/ai/proxy-image", {
      method: "POST",
      body: { imageUrl: generatedUrl },
    });

    // Convert base64 to File
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });
    const file = new File([blob], "ai-generated-image.png", {
      type: contentType,
    });

    // Set preview and file
    imageFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
  } catch (error: any) {
    console.error("Error generating image:", error);
    imageGenerationError.value =
      error.message || "Failed to generate image. Please try again.";
  } finally {
    isGeneratingImage.value = false;
  }
};

const onSubmit = () => {
  if (!validate()) return;
  emit("submit", {
    recipe: { ...form, nutrients: form.nutrients || undefined },
    ingredients: ingredients.value,
    imageFile: imageFile.value,
  });
};
</script>

<template>
  <form
    @submit.prevent="onSubmit"
    class="space-y-8 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100"
  >
    <!-- Image Upload -->
    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">{{
        $t("recipe_image_label")
      }}</label>
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-6">
          <div
            v-if="imagePreview"
            class="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200"
          >
            <img :src="imagePreview" class="w-full h-full object-cover" />
            <button
              @click="
                imageFile = null;
                imagePreview = null;
              "
              type="button"
              class="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-xs hover:bg-white text-gray-700"
            >
              ✕
            </button>
          </div>
          <div
            v-else
            class="w-32 h-32 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400"
          >
            <span class="text-xs">No image</span>
          </div>
          <div class="space-y-3">
            <div>
              <input
                type="file"
                accept="image/*"
                @change="handleImageChange"
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <p class="mt-1 text-xs text-gray-500">
                PNG, JPG, adjust up to 5MB
              </p>
            </div>

            <!-- AI Image Button -->
            <button
              v-if="!imagePreview"
              type="button"
              @click="generateImage"
              :disabled="isGeneratingImage"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-sm"
            >
              <svg
                v-if="isGeneratingImage"
                class="animate-spin h-4 w-4 text-white"
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
                isGeneratingImage
                  ? $t("generating_image")
                  : $t("generate_ai_image")
              }}
            </button>
            <p v-if="imageGenerationError" class="text-xs text-red-600">
              {{ imageGenerationError }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Basic Info -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div class="col-span-2">
        <label class="block text-sm font-medium text-gray-700">{{
          $t("recipe_title_label")
        }}</label>
        <input
          v-model="form.title"
          type="text"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          :placeholder="$t('placeholder_recipe_title')"
        />
        <p v-if="errors.title" class="mt-1 text-sm text-red-600">
          {{ errors.title }}
        </p>
      </div>

      <div class="col-span-2">
        <label class="block text-sm font-medium text-gray-700">{{
          $t("recipe_description_label")
        }}</label>
        <textarea
          v-model="form.description"
          rows="3"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          :placeholder="$t('placeholder_recipe_description')"
        ></textarea>
        <p v-if="errors.description" class="mt-1 text-sm text-red-600">
          {{ errors.description }}
        </p>
      </div>

      <div class="col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-2">{{
          $t("recipe_category_label")
        }}</label>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            v-for="cat in categories"
            :key="cat"
            class="flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer"
            :class="[
              form.categories.includes(cat)
                ? 'bg-indigo-50 border-indigo-300'
                : 'bg-white border-gray-200 hover:border-gray-300',
            ]"
            @click="toggleCategory(cat)"
          >
            <span class="text-sm font-medium text-gray-700">
              {{ $t("category_" + cat.toLowerCase()) }}
            </span>
            <div
              class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
              :class="[
                form.categories.includes(cat)
                  ? 'bg-indigo-600 border-indigo-600'
                  : 'bg-white border-gray-300',
              ]"
            >
              <svg
                v-if="form.categories.includes(cat)"
                class="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        </div>
        <p v-if="errors.categories" class="mt-2 text-sm text-red-600">
          {{ $t(errors.categories) }}
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">{{
          $t("recipe_visibility_label")
        }}</label>
        <select
          v-model="form.visibility"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="public">{{ $t("visibility_public") }}</option>
          <option value="private">{{ $t("visibility_private") }}</option>
        </select>
      </div>

      <div class="col-span-2">
        <label class="block text-sm font-medium text-gray-700">{{
          $t("recipe_experience_label")
        }}</label>
        <textarea
          v-model="form.experience"
          rows="2"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          :placeholder="$t('placeholder_experience')"
        ></textarea>
      </div>
    </div>

    <!-- Ingredients -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900">
          {{ $t("ingredients_label") }}
        </h3>
        <button
          type="button"
          @click="addIngredient"
          class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          + {{ $t("add_ingredient") }}
        </button>
      </div>

      <div class="space-y-3">
        <RecipesRecipeIngredientRow
          v-for="(ing, index) in ingredients"
          :key="index"
          :model-value="ingredients[index]!"
          @update:model-value="ingredients[index] = $event"
          :index="index"
          @remove="removeIngredient"
        />
      </div>
      <p v-if="errors.ingredients" class="mt-1 text-sm text-red-600">
        {{ errors.ingredients }}
      </p>
    </div>

    <!-- Allergens -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium text-gray-900">
        {{ $t("allergens_label") }}
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="allergen in ALL_SENSITIVITIES"
          :key="allergen"
          class="flex items-center justify-between p-3 rounded-lg border transition-colors"
          :class="[
            form.allergens.includes(allergen)
              ? isSensitiveTo(allergen)
                ? 'bg-red-100 border-red-300'
                : 'bg-green-50 border-green-200'
              : 'bg-white border-gray-200',
          ]"
        >
          <span class="text-sm font-medium text-gray-700">
            {{ $t("sensitivity_" + allergen) }}
            <span
              v-if="
                form.allergens.includes(allergen) && isSensitiveTo(allergen)
              "
              class="ml-1 text-red-600"
              :title="$t('allergen_warning')"
              >⚠️</span
            >
          </span>

          <button
            type="button"
            @click="toggleAllergen(allergen)"
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            :class="[
              form.allergens.includes(allergen)
                ? isSensitiveTo(allergen)
                  ? 'bg-red-600'
                  : 'bg-green-600'
                : 'bg-gray-200',
            ]"
            role="switch"
            :aria-checked="form.allergens.includes(allergen)"
          >
            <span
              aria-hidden="true"
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="[
                form.allergens.includes(allergen)
                  ? 'translate-x-5'
                  : 'translate-x-0',
              ]"
            ></span>
          </button>
        </div>
      </div>
      <p
        v-if="form.allergens.some((a) => isSensitiveTo(a))"
        class="text-sm text-red-600 font-medium"
      >
        {{ $t("allergen_warning") }}
      </p>
    </div>

    <!-- Nutrients -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900">
          {{ $t("nutrition_title") }}
        </h3>
        <button
          type="button"
          @click="generateNutrients"
          :disabled="isGeneratingNutrients"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
          :class="[
            form.nutrients
              ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
              : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100',
          ]"
        >
          <svg
            v-if="isGeneratingNutrients"
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
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          {{
            isGeneratingNutrients
              ? $t("generating_nutrients")
              : form.nutrients
                ? $t("regenerate_nutrients")
                : $t("generate_nutrients")
          }}
        </button>
      </div>

      <!-- Display current nutrients if available -->
      <RecipesNutritionDisplay
        v-if="form.nutrients"
        :nutrition="form.nutrients"
      />

      <!-- Error message -->
      <p v-if="nutrientsError" class="text-sm text-red-600">
        {{ nutrientsError }}
      </p>

      <!-- Hint when no nutrients -->
      <p
        v-if="!form.nutrients && !nutrientsError"
        class="text-sm text-gray-500"
      >
        {{ $t("ai_generate_description") }}
      </p>
    </div>

    <!-- Submit -->
    <div class="pt-4 border-t border-gray-100 flex justify-end">
      <button
        type="submit"
        :disabled="isLoading"
        class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          v-if="isLoading"
          class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
          isLoading
            ? $t("loading")
            : initialData
              ? $t("save_changes")
              : $t("save_recipe")
        }}
      </button>
    </div>
  </form>
</template>
