<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();

const { data: recipes, refresh } = await useAsyncData("recipes", async () => {
  const userId = user.value?.id || user.value?.sub;
  const { data } = await supabase
    .from("recipes")
    .select("id, title, image_url, recipe_categories(category)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data || [];
});

const categories = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];

// Group recipes by category - a recipe can appear in multiple groups
const groupedRecipes = computed(() => {
  if (!recipes.value) return {};
  const groups: Record<string, typeof recipes.value> = {};
  categories.forEach((cat) => {
    groups[cat] = recipes.value!.filter((r) =>
      r.recipe_categories?.some(
        (rc: { category: string }) => rc.category === cat,
      ),
    );
  });
  return groups;
});

const handleDelete = async (id: string) => {
  if (!confirm("Are you sure you want to delete this recipe?")) return;
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (!error) refresh();
};
</script>

<template>
  <div class="space-y-12">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">{{ $t('recipes') }}</h1>
      <div class="flex items-center gap-3">
        <NuxtLink
          to="/recipes/ai-generate"
          class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          ✨ {{ $t("ai_generate") }}
        </NuxtLink>
        <NuxtLink
          to="/recipes/new"
          class="bg-black text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
        >
          + {{ $t("add_recipe") || "Add Recipe" }}
        </NuxtLink>
      </div>
    </div>

    <div v-for="category in categories" :key="category" class="space-y-6">
      <div v-if="groupedRecipes[category]?.length">
        <h2
          class="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4"
        >
          {{ $t("category_" + category.toLowerCase()) }}
        </h2>
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <RecipeCard
            v-for="recipe in groupedRecipes[category]"
            :key="recipe.id"
            :recipe="recipe"
            @delete="handleDelete"
          />
        </div>
      </div>
    </div>

    <div v-if="!recipes?.length" class="text-center py-20 text-gray-500">
      <p>No recipes found. Create your first one!</p>
    </div>
  </div>
</template>
