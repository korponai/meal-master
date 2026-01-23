<script setup lang="ts">
import type { Database } from "@/types/database.types";
import RecipeForm from "@/components/recipes/RecipeForm.vue";

definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();

const recipeId = route.params.id as string;
const isLoading = ref(false);

const { data: recipe, error: fetchError } = await useAsyncData(`recipe-edit-${recipeId}`, async () => {
    // Fetch recipe components joined
    const { data, error } = await supabase
        .from("recipes")
        .select("*, recipe_ingredients(*, ingredients(id, name))")
        .eq("id", recipeId)
        .single();
    
    if (error) throw error;
    
    if (user.value && user.value.id) {
        console.log("Auth Check:", { recipeOwner: data.user_id, currentUser: user.value.id });
        if (data.user_id !== user.value.id) {
             throw new Error(`You are not authorized to edit this recipe. Owner: ${data.user_id}, You: ${user.value.id}`);
        }
    }
    
    console.log("Fetched Recipe Data:", data);
    return data;
});

// Redirect on basic error or unauthorized (if caught)
if (fetchError.value) {
    console.error("Edit Page Load Error:", fetchError.value);
    // router.push("/recipes"); // Disable redirect for debugging
}

const updateImage = async (file: File) => {
    if (!user.value || !user.value.id) {
        // Try fetching user again to be sure
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser || !currentUser.id) throw new Error("User not authenticated properly (missing ID)");
        user.value = currentUser; // Update the composable state if possible/needed
    }
    
    // safe to access user.value.id (or we use a local var)
    const userId = user.value!.id;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
        .from('recipe-images')
        .upload(fileName, file);
        
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(fileName);
        
    return publicUrl;
}

const handleSubmit = async (payload: { recipe: any, ingredients: any[], imageFile: File | null }) => {
  if (!user.value) return;
  isLoading.value = true;
  
  try {
    // 1. Upload new image if present
    let imageUrl = payload.recipe.image_url; // Keep old image by default
    if (payload.imageFile) {
        imageUrl = await updateImage(payload.imageFile);
    }

    // 2. Update Recipe
    const { error: updateError } = await supabase
      .from("recipes")
      .update({
        title: payload.recipe.title,
        description: payload.recipe.description,
        category: payload.recipe.category,
        visibility: payload.recipe.visibility,
        experience: payload.recipe.experience || null,
        image_url: imageUrl
      })
      .eq("id", recipeId);
      
    if (updateError) throw updateError;

    // 3. Sync Ingredients
    // 3.1 Delete existing ingredients
    const { error: deleteError } = await supabase
        .from("recipe_ingredients")
        .delete()
        .eq("recipe_id", recipeId);
        
    if (deleteError) throw deleteError;
    
    // 3.2 Insert new list
    if (payload.ingredients.length > 0) {
        const ingredientsToInsert = payload.ingredients.map(ing => ({
            recipe_id: recipeId,
            ingredient_id: ing.ingredient.id,
            quantity: ing.quantity,
            unit: ing.unit
        }));
        
        const { error: insertError } = await supabase
            .from("recipe_ingredients")
            .insert(ingredientsToInsert);
        
        if (insertError) throw insertError;
    }
    
    router.push("/recipes");
  } catch (error: any) {
    console.error(error);
    alert(error.message || "An error occurred while updating the recipe");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="max-w-3xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">{{ $t('edit_recipe') }}</h1>
    <div v-if="recipe">
        <RecipeForm :initialData="recipe" :isLoading="isLoading" @submit="handleSubmit" />
    </div>
    <div v-else class="text-center py-12">
        <p>Loading...</p>
    </div>
  </div>
</template>
