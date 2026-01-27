<script setup lang="ts">
import type { MealPlan } from "~/types/meal-plan";

defineProps<{
  meal: MealPlan;
}>();

const emit = defineEmits<{
  (e: "delete", id: string): void;
}>();
</script>

<template>
  <div
    class="group relative bg-white rounded-lg shadow-sm border border-gray-100 p-2 hover:shadow-md transition-shadow"
  >
    <NuxtLink
      v-if="meal.recipes?.id"
      :to="`/recipes/${meal.recipes.id}`"
      class="flex items-start gap-2 min-w-0"
    >
      <img
        v-if="meal.recipes?.image_url"
        :src="meal.recipes.image_url"
        alt=""
        class="h-10 w-10 rounded object-cover flex-shrink-0 bg-gray-200"
      />
      <div class="min-w-0 flex-1">
        <p
          class="text-xs font-medium text-gray-900 truncate hover:text-green-600 transition-colors"
        >
          {{ meal.recipes?.title || meal.custom_name || "Unknown Recipe" }}
        </p>
      </div>
    </NuxtLink>
    <div v-else class="flex items-start gap-2 min-w-0">
      <div class="min-w-0 flex-1">
        <p class="text-xs font-medium text-gray-900 truncate">
          {{ meal.custom_name || "Unknown Item" }}
        </p>
      </div>
    </div>
    <button
      @click="emit('delete', meal.id)"
      class="absolute -top-1 -right-1 bg-red-100 text-red-600 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
      title="Remove meal"
    >
      <svg
        class="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
</template>
