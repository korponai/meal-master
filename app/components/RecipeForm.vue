<script setup lang="ts">
const props = defineProps<{
  initialData?: {
    title: string;
    description: string;
    category: string;
    image_url?: string;
    ingredients: any[];
    instructions: string;
  };
  isLoading: boolean;
}>();

const emit = defineEmits(["submit"]);

const form = ref({
  title: "",
  description: "",
  category: "Breakfast",
  image_url: "",
  ingredients: [] as any[],
  instructions: "",
});

onMounted(() => {
  if (props.initialData) {
    form.value = JSON.parse(JSON.stringify(props.initialData));
  }
});

const categories = ["Breakfast", "Lunch", "Dinner", "Snack"];

const handleSubmit = () => {
  emit("submit", form.value);
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Title</label>
      <input
        v-model="form.title"
        type="text"
        required
        class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-4 py-3"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
      <select
        v-model="form.category"
        class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-4 py-3"
      >
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
      <textarea
        v-model="form.description"
        rows="3"
        class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-4 py-3"
      ></textarea>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
      <textarea
        v-model="form.instructions"
        rows="6"
        class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-4 py-3"
      ></textarea>
    </div>

    <!-- TODO: Ingredients Dynamic List (skipping purely complex UI for now to stick to main task) -->
    
    <div class="flex justify-end gap-3 pt-4">
      <NuxtLink to="/recipes" class="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
        Cancel
      </NuxtLink>
      <button
        type="submit"
        :disabled="isLoading"
        class="px-6 py-2.5 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {{ isLoading ? "Saving..." : "Save Recipe" }}
      </button>
    </div>
  </form>
</template>
