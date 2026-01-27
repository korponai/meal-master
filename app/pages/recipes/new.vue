<script setup lang="ts">
import type { Database } from "@/types/database.types";
import RecipeForm from "@/components/recipes/RecipeForm.vue";

definePageMeta({
  middleware: "auth",
});

const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();
const router = useRouter();

const isLoading = ref(false);

const uploadImage = async (file: File) => {
  console.log("Upload Image - User Check:", user.value);

  let userId = user.value?.id;

  if (!userId) {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    userId = currentUser?.id;
  }

  if (!userId) {
    throw new Error("User not authenticated properly (missing ID)");
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("recipe-images")
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("recipe-images").getPublicUrl(fileName);

  return publicUrl;
};

const handleSubmit = async (payload: {
  recipe: any;
  ingredients: any[];
  imageFile: File | null;
}) => {
  if (!user.value) return;
  isLoading.value = true;

  try {
    // 1. Upload Image
    let imageUrl = null;
    if (payload.imageFile) {
      imageUrl = await uploadImage(payload.imageFile);
    }

    // 2. Insert Recipe
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .insert({
        title: payload.recipe.title,
        description: payload.recipe.description,
        visibility: payload.recipe.visibility,
        experience: payload.recipe.experience || null,
        allergens: payload.recipe.allergens || [],
        nutrients: payload.recipe.nutrients || null,
        image_url: imageUrl,
        // user_id is handled by database default auth.uid()
      })
      .select()
      .single();

    if (recipeError) throw recipeError;
    if (!recipe || !("id" in recipe) || !recipe.id) {
      throw new Error("Failed to create recipe");
    }

    const recipeId = recipe.id as string;

    // 3. Insert Categories
    if (payload.recipe.categories && payload.recipe.categories.length > 0) {
      const categoriesToInsert = payload.recipe.categories.map(
        (cat: string) => ({
          recipe_id: recipeId,
          category: cat,
        }),
      );

      const { error: categoriesError } = await supabase
        .from("recipe_categories")
        .insert(categoriesToInsert);

      if (categoriesError) throw categoriesError;
    }

    // 4. Insert Ingredients
    const ingredientsToInsert = payload.ingredients.map((ing) => ({
      recipe_id: recipeId,
      ingredient_id: ing.ingredient.id,
      quantity: ing.quantity,
      unit: ing.unit,
    }));

    if (ingredientsToInsert.length > 0) {
      const { error: ingredientsError } = await supabase
        .from("recipe_ingredients")
        .insert(ingredientsToInsert);

      if (ingredientsError) {
        // Rollback recipe? For now just throw
        // await supabase.from("recipes").delete().eq("id", recipe.id);
        throw ingredientsError;
      }
    }

    router.push("/recipes");
  } catch (error: any) {
    console.error(error);
    alert(error.message || "An error occurred while creating the recipe");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="max-w-3xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">
      {{ $t("create_recipe") }}
    </h1>
    <RecipeForm :isLoading="isLoading" @submit="handleSubmit" />
  </div>
</template>
