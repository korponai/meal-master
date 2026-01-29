<script setup lang="ts">
import type { Database } from "@/types/database.types";
import { ALL_SENSITIVITIES } from "@/utils/constants";

// DB constraint-compliant units
const VALID_UNITS = new Set([
  "teaspoon",
  "tablespoon",
  "cup",
  "pint",
  "milliliter",
  "liter",
  "gram",
  "kilogram",
  "pinch",
  "by_count",
]);

const normalizeUnit = (unit: string): string => {
  if (!unit) return "by_count";
  const u = unit.toLowerCase().trim();

  if (VALID_UNITS.has(u)) return u;

  // Common mappings
  if (["tsp", "t"].includes(u)) return "teaspoon";
  if (["tbsp", "tbs", "T"].includes(u)) return "tablespoon";
  if (["g", "gms", "gm"].includes(u)) return "gram";
  if (["kg", "kgs"].includes(u)) return "kilogram";
  if (["ml", "mls"].includes(u)) return "milliliter";
  if (["l", "liters"].includes(u)) return "liter";
  if (["c", "cups"].includes(u)) return "cup";
  if (["lb", "lbs", "pound", "pounds"].includes(u)) {
    // DB doesn't support pounds, map to gram (approx) or by_count?
    // Ideally we should convert quantity too, but that's complex.
    // For now, let's map to by_count to avoid crash, or add 'pound' to DB.
    // Given the constraints, let's map generic "pieces" to by_count.
    return "by_count";
  }
  if (["oz", "ounce", "ounces"].includes(u)) return "by_count"; // Same issue

  if (
    [
      "pcs",
      "piece",
      "pieces",
      "count",
      "whole",
      "slice",
      "slices",
      "clove",
      "cloves",
    ].includes(u)
  )
    return "by_count";

  // Fallback
  console.warn(`Unknown unit "${unit}" mapped to "by_count"`);
  return "by_count";
};

definePageMeta({
  middleware: "auth",
});

interface GeneratedRecipe {
  title: string;
  description: string;
  category: "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Dessert";
  ingredients: { name: string; quantity: number; unit: string }[];
  allergens: string[];
}

const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();
const router = useRouter();
const localePath = useLocalePath();
const { csrf } = useCsrf();

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
      headers: {
        "csrf-token": csrf,
      },
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

  // Use a Set to avoid processing duplicates
  const uniqueNames = [...new Set(ingredientNames.map((n) => n.trim()))];

  for (const name of uniqueNames) {
    if (!name) continue;

    // Check if ingredient exists (case-insensitive)
    const { data: existing } = await supabase
      .from("ingredients")
      .select("id, name")
      .ilike("name", name)
      .maybeSingle();

    if (existing) {
      ingredientMap.set(name.toLowerCase(), existing.id);
    } else {
      // Create new ingredient
      // We try to insert. If it fails (e.g. race condition/unique constraint), we try to fetch again.
      const { data: newIngredient, error: insertError } = await supabase
        .from("ingredients")
        .insert({ name })
        .select("id")
        .single();

      if (insertError) {
        // If insert failed, maybe it exists now?
        const { data: retryExisting } = await supabase
          .from("ingredients")
          .select("id, name")
          .ilike("name", name)
          .maybeSingle();

        if (retryExisting) {
          ingredientMap.set(name.toLowerCase(), retryExisting.id);
        } else {
          console.error(`Failed to insert ingredient "${name}":`, insertError);
        }
      } else if (newIngredient) {
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
        visibility: "public", // Default to public
        allergens: recipe.allergens || [],
        image_url: finalImageUrl,
      })
      .select()
      .single();

    if (recipeError) throw recipeError;
    if (!savedRecipe) throw new Error("Failed to create recipe");

    // 4. Insert Category
    const { error: categoryError } = await supabase
      .from("recipe_categories")
      .insert({
        recipe_id: savedRecipe.id,
        category: recipe.category,
      });

    if (categoryError) {
      console.error("Category insert error:", categoryError);
      // We don't block saving if category fails, but good to know
    }

    // 5. Insert Ingredients
    const ingredientsToInsert = recipe.ingredients
      .map((ing) => {
        const ingredientId = ingredientMap.get(ing.name.trim().toLowerCase());
        if (!ingredientId) {
          console.warn(`Skipping ingredient "${ing.name}" - ID not found`);
          return null;
        }
        return {
          recipe_id: savedRecipe.id,
          ingredient_id: ingredientId,
          quantity: ing.quantity,
          unit: normalizeUnit(ing.unit),
        };
      })
      .filter(Boolean);

    if (ingredientsToInsert.length > 0) {
      const { error: ingredientsError } = await supabase
        .from("recipe_ingredients")
        .insert(ingredientsToInsert as any[]);

      if (ingredientsError) {
        throw new Error(
          `Failed to save ingredients: ${ingredientsError.message}`,
        );
      }
    }

    // 6. Navigate to edit page for final adjustments
    router.push(localePath(`/recipes/${savedRecipe.id}/edit`));
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
        :to="localePath('/recipes')"
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
