<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const recipeId = route.params.id as string;
const isLoading = ref(false);
const recipe = ref<any>(null);

const { data } = await useAsyncData(`recipe-${recipeId}`, async () => {
    const { data } = await supabase.from("recipes").select("*").eq("id", recipeId).single();
    return data;
});

if (data.value) {
    recipe.value = data.value;
}

const handleSubmit = async (formData: any) => {
  isLoading.value = true;
  try {
    const userId = user.value?.id || user.value?.sub;
    const { error } = await supabase
      .from("recipes")
      .update(formData)
      .eq("id", recipeId)
      .eq("user_id", userId);
    
    if (error) throw error;
    router.push("/recipes");
  } catch (error: any) {
    alert(error.message);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Edit Recipe</h1>
    <div v-if="recipe">
        <RecipeForm :initialData="recipe" :isLoading="isLoading" @submit="handleSubmit" />
    </div>
    <div v-else class="text-center py-12">
        <p>Loading...</p>
    </div>
  </div>
</template>
