<script setup lang="ts">
import type { Database } from "@/types/database.types";

definePageMeta({
  middleware: "auth",
});

interface GeneratedRecipe {
  title: string;
  description: string;
  category: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  ingredients: { name: string; quantity: number; unit: string }[];
  allergens: string[];
}

const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();
const router = useRouter();

const isLoading = ref(false);

// Download image from URL via server proxy and upload to Supabase storage
const downloadAndUploadImage = async (
  imageUrl: string,
): Promise<string | null> => {
  try {
    // Get current user ID
    let userId = user.value?.id;
    if (!userId) {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      userId = currentUser?.id;
    }
    if (!userId) throw new Error("User not authenticated");

    // Use server-side proxy to download the image (avoids CORS issues)
    const { data: proxyData, error: proxyError } = await useFetch<{
      base64: string;
      contentType: string;
    }>("/api/ai/proxy-image", {
      method: "POST",
      body: { imageUrl },
    });

    if (proxyError.value || !proxyData.value) {
      throw new Error(proxyError.value?.message || "Failed to proxy image");
    }

    // Convert base64 to blob
    const binaryString = atob(proxyData.value.base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: proxyData.value.contentType });

    const fileName = `${userId}/${Date.now()}.png`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from("recipe-images")
      .upload(fileName, blob, {
        contentType: "image/png",
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("recipe-images").getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading AI image:", error);
    return null;
  }
};

// Ensure ingredients exist in DB and get their IDs
const ensureIngredients = async (
  ingredientNames: string[],
): Promise<Map<string, string>> => {
  const ingredientMap = new Map<string, string>();

  for (const name of ingredientNames) {
    // Check if ingredient exists
    const { data: existing } = await supabase
      .from("ingredients")
      .select("id, name")
      .ilike("name", name)
      .single();

    if (existing) {
      ingredientMap.set(name.toLowerCase(), existing.id);
    } else {
      // Create new ingredient
      const { data: newIngredient, error } = await supabase
        .from("ingredients")
        .insert({ name })
        .select("id")
        .single();

      if (newIngredient && !error) {
        ingredientMap.set(name.toLowerCase(), newIngredient.id);
      }
    }
  }

  return ingredientMap;
};

const handleSave = async (recipe: GeneratedRecipe, imageUrl: string | null) => {
  if (!user.value) return;
  isLoading.value = true;

  try {
    // 1. Upload image if provided
    let finalImageUrl: string | null = null;
    if (imageUrl) {
      finalImageUrl = await downloadAndUploadImage(imageUrl);
    }

    // 2. Ensure all ingredients exist and get their IDs
    const ingredientNames = recipe.ingredients.map((i) => i.name);
    const ingredientMap = await ensureIngredients(ingredientNames);

    // 3. Insert Recipe
    const { data: savedRecipe, error: recipeError } = await supabase
      .from("recipes")
      .insert({
        title: recipe.title,
        description: recipe.description,
        category: recipe.category,
        visibility: "public", // Default to public
        allergens: recipe.allergens || [],
        image_url: finalImageUrl,
      })
      .select()
      .single();

    if (recipeError) throw recipeError;
    if (!savedRecipe) throw new Error("Failed to create recipe");

    // 4. Insert Ingredients
    const ingredientsToInsert = recipe.ingredients
      .map((ing) => {
        const ingredientId = ingredientMap.get(ing.name.toLowerCase());
        if (!ingredientId) return null;
        return {
          recipe_id: savedRecipe.id,
          ingredient_id: ingredientId,
          quantity: ing.quantity,
          unit: ing.unit,
        };
      })
      .filter(Boolean);

    if (ingredientsToInsert.length > 0) {
      const { error: ingredientsError } = await supabase
        .from("recipe_ingredients")
        .insert(ingredientsToInsert as any[]);

      if (ingredientsError) {
        console.error("Ingredients insert error:", ingredientsError);
      }
    }

    // 5. Navigate to edit page for final adjustments
    router.push(`/recipes/${savedRecipe.id}/edit`);
  } catch (error: any) {
    console.error("Save error:", error);
    alert(error.message || "An error occurred while saving the recipe");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="max-w-3xl mx-auto py-10 px-4">
    <div class="mb-6">
      <NuxtLink
        to="/recipes"
        class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        ← {{ $t("recipes") }}
      </NuxtLink>
    </div>

    <!-- Loading Overlay -->
    <div
      v-if="isLoading"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-2xl p-8 flex flex-col items-center gap-4">
        <svg
          class="animate-spin h-10 w-10 text-indigo-600"
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
        <p class="text-gray-700 font-medium">{{ $t("loading") }}</p>
      </div>
    </div>

    <RecipesAIRecipeGenerator @save="handleSave" />
  </div>
</template>
