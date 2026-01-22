<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();

const isLoading = ref(false);

const handleSubmit = async (formData: any) => {
  isLoading.value = true;
  try {
    const { error } = await supabase.from("recipes").insert({
      ...formData,
      user_id: user.value?.id,
    });
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
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Create New Recipe</h1>
    <RecipeForm :isLoading="isLoading" @submit="handleSubmit" />
  </div>
</template>
