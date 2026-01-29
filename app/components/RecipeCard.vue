<script setup lang="ts">
const props = defineProps<{
  recipe: {
    id: string;
    title: string;
    image_url: string | null;
    user_id: string;
    recipe_categories?: { category: string }[];
  };
  userId?: string;
}>();

const { t, te } = useI18n();

const emit = defineEmits(["delete"]);
const router = useRouter();
const localePath = useLocalePath();

const navigateToEdit = () => {
  console.log("Edit clicked for recipe:", props.recipe.id);
  router
    .push(localePath(`/recipes/${props.recipe.id}/edit`))
    .catch((err) => console.error("Navigation error:", err));
};

// Check if current user owns this recipe
const isOwner = computed(() => {
  const owns = props.userId && props.recipe.user_id === props.userId;
  console.log("RecipeCard ownership check:", {
    recipeId: props.recipe.id,
    recipeUserId: props.recipe.user_id,
    currentUserId: props.userId,
    isOwner: owns,
  });
  return owns;
});
</script>

<template>
  <div
    class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
  >
    <div class="aspect-[4/3] bg-gray-100 relative">
      <img
        v-if="recipe.image_url"
        :src="recipe.image_url"
        :alt="recipe.title"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-gray-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      </div>
    </div>
    <div class="p-4 flex flex-col flex-grow">
      <h3 class="font-bold text-lg text-gray-900 mb-2">{{ recipe.title }}</h3>

      <!-- Category Tags -->
      <div
        v-if="recipe.recipe_categories?.length"
        class="flex flex-wrap gap-1 mb-4"
      >
        <span
          v-for="rc in recipe.recipe_categories"
          :key="rc.category"
          class="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
        >
          {{
            te("category_" + rc.category.toLowerCase())
              ? t("category_" + rc.category.toLowerCase())
              : rc.category
          }}
        </span>
      </div>

      <div class="mt-auto flex items-center justify-between gap-2">
        <NuxtLink
          :to="localePath(`/recipes/${recipe.id}`)"
          class="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {{ $t("view") }}
        </NuxtLink>
        <button
          v-if="isOwner"
          @click.prevent.stop="navigateToEdit"
          class="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {{ $t("edit") }}
        </button>
        <button
          v-if="isOwner"
          @click="$emit('delete', recipe.id)"
          class="px-3 py-1 bg-red-50 text-red-600 rounded-md text-xs font-medium hover:bg-red-100 transition"
        >
          {{ $t("delete") }}
        </button>
      </div>
    </div>
  </div>
</template>
