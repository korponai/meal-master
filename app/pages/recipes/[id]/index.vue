<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const supabase = useSupabaseClient();
const recipeId = route.params.id as string;

const { data: recipe } = await useAsyncData(`recipe-${recipeId}`, async () => {
  const { data } = await supabase.from("recipes").select("*").eq("id", recipeId).single();
  return data;
});

const handleDelete = async () => {
    if(!confirm("Delete this recipe?")) return;
    await supabase.from("recipes").delete().eq("id", recipeId);
    navigateTo("/recipes");
}
</script>

<template>
  <div v-if="recipe" class="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- Hero Image -->
    <div class="h-64 sm:h-96 w-full bg-gray-200 relative">
       <img v-if="recipe.image_url" :src="recipe.image_url" class="absolute inset-0 w-full h-full object-cover">
       <div v-else class="absolute inset-0 flex items-center justify-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
       </div>
    </div>

    <div class="p-8 sm:p-12">
        <div class="flex justify-between items-start mb-6">
            <div>
                 <span class="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold uppercase tracking-wide mb-2">
                    {{ recipe.category }}
                 </span>
                 <h1 class="text-4xl font-bold text-gray-900">{{ recipe.title }}</h1>
            </div>
            <div class="flex gap-2">
                <NuxtLink :to="`/recipes/${recipe.id}/edit`" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">{{ $t('edit') }}</NuxtLink>
                <button @click="handleDelete" class="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium hover:bg-red-100">{{ $t('delete') }}</button>
            </div>
        </div>

        <p class="text-gray-600 text-lg leading-relaxed mb-8 border-b border-gray-100 pb-8">
            {{ recipe.description }}
        </p>

        <div class="grid md:grid-cols-3 gap-12">
            <div class="md:col-span-1">
                <h3 class="font-bold text-xl mb-4">{{ $t('ingredients_label') }}</h3>
                <!-- Placeholder for ingredient list -->
                <ul class="space-y-2 text-gray-700">
                    <li class="flex items-center gap-2">
                        <div class="w-1.5 h-1.5 bg-black rounded-full"></div>
                        <span>{{ $t('ingredients_not_structured') }}</span>
                    </li>
                </ul>
            </div>
             <div class="md:col-span-2">
                <h3 class="font-bold text-xl mb-4">{{ $t('instructions_label') }}</h3>
                <div class="prose max-w-none text-gray-700 whitespace-pre-line">
                    {{ recipe.instructions }}
                </div>
            </div>
        </div>
    </div>
  </div>
  <div v-else class="text-center py-20">
      <p class="text-gray-500">Loading recipe...</p>
  </div>
</template>
