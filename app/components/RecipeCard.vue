<script setup lang="ts">
defineProps<{
  recipe: {
    id: string;
    title: string;
    image_url: string | null;
    category: string;
  };
}>();

const emit = defineEmits(["delete"]);
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
    <div class="aspect-[4/3] bg-gray-100 relative">
      <img
        v-if="recipe.image_url"
        :src="recipe.image_url"
        :alt="recipe.title"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
      </div>
    </div>
    <div class="p-4 flex flex-col flex-grow">
      <h3 class="font-bold text-lg text-gray-900 mb-4">{{ recipe.title }}</h3>
      
      <div class="mt-auto flex items-center justify-between gap-2">
        <NuxtLink :to="`/recipes/${recipe.id}`" class="px-4 py-1.5 bg-black text-white text-xs font-semibold rounded-full hover:bg-gray-800 transition-colors">
          View
        </NuxtLink>
        <NuxtLink :to="`/recipes/${recipe.id}/edit`" class="px-4 py-1.5 bg-black text-white text-xs font-semibold rounded-full hover:bg-gray-800 transition-colors">
          Edit
        </NuxtLink>
        <button @click="$emit('delete', recipe.id)" class="px-4 py-1.5 bg-black text-white text-xs font-semibold rounded-full hover:bg-gray-800 transition-colors">
          Delete
        </button>
      </div>
    </div>
  </div>
</template>
