<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();

// Fetch user ID directly from auth session to avoid SSR timing issues
const currentUserId = ref<string | undefined>(undefined);

onMounted(async () => {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  currentUserId.value = authUser?.id;
});

const { data: recipes, refresh } = await useAsyncData("recipes", async () => {
  // Remove user_id filter to show public recipes from all users
  // RLS policies will return: user's own recipes + public recipes from others
  const { data } = await supabase
    .from("recipes")
    .select("id, title, image_url, user_id, recipe_categories(category)")
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

  // Debug: Log user ID to check if it's being set correctly
  console.log("Recipe index - Current user ID:", user.value?.id);

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
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">
        {{ $t("recipes") }}
      </h1>
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
            :user-id="currentUserId"
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
