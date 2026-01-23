<script setup lang="ts">
import { z } from "zod";
import type { Database } from "@/types/database.types";
import type { RecipeIngredient } from "./RecipeIngredientRow.vue";
import RecipesRecipeIngredientRow from "./RecipeIngredientRow.vue"; // Explicit import if auto-import fails or for clarity

const categories = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;
const visibilities = ["public", "private"] as const;

// Zod Schema
const ingredientSchema = z.object({
  ingredient: z.object({ id: z.string(), name: z.string() }).nullable(),
  quantity: z.number().min(0, "Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
}).refine(data => data.ingredient !== null, {
    message: "Ingredient is required",
    path: ["ingredient"]
});

const recipeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(categories),
  visibility: z.enum(visibilities),
  experience: z.string().optional(),
});

// Emits
const emit = defineEmits<{
  (e: "submit", payload: { 
      recipe: z.infer<typeof recipeSchema>; 
      ingredients: RecipeIngredient[]; 
      imageFile: File | null 
  }): void;
}>();

const props = defineProps<{
  isLoading?: boolean;
  initialData?: any;
}>();

// State
const form = reactive({
  title: "",
  description: "",
  category: "" as typeof categories[number] | "",
  visibility: "public" as typeof visibilities[number],
  experience: "",
});

const ingredients = ref<RecipeIngredient[]>([
  { ingredient: null, quantity: null, unit: "gram" },
]);

const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const errors = ref<Record<string, string>>({});

// Watch initialData to populate form
watch(() => props.initialData, (newData) => {
    if (newData) {
        form.title = newData.title || "";
        form.description = newData.description || "";
        form.category = newData.category || "";
        form.visibility = newData.visibility || "public";
        form.experience = newData.experience || "";
        
        if (newData.image_url) {
            imagePreview.value = newData.image_url;
        }

        if (Array.isArray(newData.recipe_ingredients) && newData.recipe_ingredients.length > 0) {
            ingredients.value = newData.recipe_ingredients.map((ri: any) => ({
                ingredient: ri.ingredients, 
                quantity: Number(ri.quantity),
                unit: ri.unit
            }));
        }
    }
}, { immediate: true });

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
           errors.value['ingredients'] = "Please ensure all ingredients have a name, quantity, and unit.";
      }
  });
  if (ingredients.value.length === 0) {
      errors.value['ingredients'] = "At least one ingredient is required.";
      hasIngredientErrors = true;
  }

  return result.success && !hasIngredientErrors;
};

const onSubmit = () => {
  if (!validate()) return;
  emit("submit", {
    recipe: { ...form, category: form.category as any },
    ingredients: ingredients.value,
    imageFile: imageFile.value,
  });
};
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-8 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
    
    <!-- Image Upload -->
    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">Recipe Image</label>
      <div class="flex items-center gap-6">
        <div v-if="imagePreview" class="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200">
            <img :src="imagePreview" class="w-full h-full object-cover" />
            <button @click="imageFile = null; imagePreview = null" type="button" class="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-xs hover:bg-white text-gray-700">✕</button>
        </div>
        <div v-else class="w-32 h-32 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
            <span class="text-xs">No image</span>
        </div>
        <div>
            <input 
                type="file" 
                accept="image/*" 
                @change="handleImageChange"
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <p class="mt-1 text-xs text-gray-500">PNG, JPG, adjust up to 5MB</p>
        </div>
      </div>
    </div>

    <!-- Basic Info -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div class="col-span-2">
        <label class="block text-sm font-medium text-gray-700">Title</label>
        <input 
            v-model="form.title" 
            type="text" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g. Grandma's Apple Pie"
        />
        <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
      </div>

      <div class="col-span-2">
        <label class="block text-sm font-medium text-gray-700">Description</label>
        <textarea 
            v-model="form.description" 
            rows="3" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Describe your recipe..."
        ></textarea>
        <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Category</label>
        <select 
            v-model="form.category" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="" disabled>Select category</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <p v-if="errors.category" class="mt-1 text-sm text-red-600">{{ errors.category }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Visibility</label>
        <select 
            v-model="form.visibility" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>
      
      <div class="col-span-2">
        <label class="block text-sm font-medium text-gray-700">Experience / Notes (Optional)</label>
        <textarea 
            v-model="form.experience" 
            rows="2" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Share your experience or tips..."
        ></textarea>
      </div>
    </div>

    <!-- Ingredients -->
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Ingredients</h3>
            <button 
                type="button" 
                @click="addIngredient"
                class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
                + Add Ingredient
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
        <p v-if="errors.ingredients" class="mt-1 text-sm text-red-600">{{ errors.ingredients }}</p>
    </div>

    <!-- Submit -->
    <div class="pt-4 border-t border-gray-100 flex justify-end">
        <button 
            type="submit" 
            :disabled="isLoading"
            class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ isLoading ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Recipe') }}
        </button>
    </div>

  </form>
</template>
