<script setup lang="ts">
import { startOfWeek, addDays, format } from "date-fns";

definePageMeta({
  middleware: "auth",
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();

const currentWeekStart = ref(startOfWeek(new Date(), { weekStartsOn: 1 }));
const weekDays = computed(() => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentWeekStart.value, i);
    return {
      date,
      label: format(date, "EEEE"),
      iso: format(date, "yyyy-MM-dd"),
    };
  });
});

const { data: mealPlans, refresh } = await useAsyncData("meal-plans", async () => {
    // Fetch meals for the week
    const start = format(weekDays.value[0].date, "yyyy-MM-dd");
    const end = format(weekDays.value[6].date, "yyyy-MM-dd");
    
    const { data } = await supabase
        .from("meal_plans")
        .select(`
            id, date, meal_type, custom_name,
            recipe:recipes(id, title, image_url)
        `)
        .eq("user_id", user.value?.id || user.value?.sub)
        .gte("date", start)
        .lte("date", end);
    return data || [];
});

// Fetch recipes once
const { data: recipes } = await useAsyncData("all-recipes", async () => {
    const userId = user.value?.id || user.value?.sub;
    if (!userId) return [];
    const { data } = await supabase.from("recipes").select("id, title").eq("user_id", userId);
    return data || [];
});

const fetchMealPlan = async () => {
    const userId = user.value?.id || user.value?.sub;
    if (!userId) {
        console.warn("User ID not available for fetching meal plan.");
        return;
    }

    const start = format(currentWeekStart.value, "yyyy-MM-dd");
    const end = format(addDays(currentWeekStart.value, 6), "yyyy-MM-dd");
    
    const { data, error } = await supabase.from("meal_plans")
        .select(`
            id, date, meal_type, custom_name,
            recipe:recipes(id, title, image_url)
        `)
        .eq("user_id", userId)
        .gte("date", start)
        .lte("date", end);

    if (error) {
        console.error("Error fetching meal plans:", error);
        return;
    }
        
    // Reset meals for all days
    weekDays.value.forEach(day => {
        day.meals = { breakfast: [], lunch: [], dinner: [], snack: [], any: [] };
    });
    
    if (data) {
        data.forEach((plan: any) => {
             const day = weekDays.value.find(d => d.date === plan.date);
             if (day) {
                 const mealTypeKey = plan.meal_type?.toLowerCase() || 'any';
                 if (day.meals[mealTypeKey]) {
                     day.meals[mealTypeKey].push(plan);
                 } else {
                     day.meals.any.push(plan); // Fallback for unknown meal types
                 }
             }
        });
    }
};

// Initial fetch and re-fetch on week change
watch(currentWeekStart, fetchMealPlan, { immediate: true });


const showAddModal = ref(false);
const selectedDate = ref(""); // ISO string
const selectedMealType = ref("any"); // Default to 'any'
const selectedRecipeId = ref(""); // Stores recipe ID

const openAddModal = (dateIso: string, mealType: string = 'any') => {
    selectedDate.value = dateIso;
    selectedMealType.value = mealType;
    selectedRecipeId.value = "";
    showAddModal.value = true;
};

const closeAddModal = () => {
    showAddModal.value = false;
    selectedDate.value = "";
    selectedMealType.value = "any";
    selectedRecipeId.value = "";
};

const addMeal = async () => {
    if (!selectedRecipeId.value || !selectedDate.value) return;
    
    const userId = user.value?.id || user.value?.sub; // Fallback
    if (!userId) {
        alert("User not authenticated.");
        return;
    }

    const selectedRecipe = recipes.value?.find(r => r.id === selectedRecipeId.value);

    const { error } = await supabase.from("meal_plans").insert({
        user_id: userId,
        date: selectedDate.value,
        recipe_id: selectedRecipeId.value,
        meal_type: selectedMealType.value,
        custom_name: selectedRecipe?.title || null // Store title for easier display if recipe deleted
    });
    
    if (error) {
        alert("Error adding meal: " + error.message);
    } else {
        closeAddModal();
        fetchMealPlan(); // Re-fetch the meal plan for the current week
    }
};

const removeMeal = async (id: string) => {
    if(!confirm("Remove meal?")) return;
    const { error } = await supabase.from("meal_plans").delete().eq("id", id);
    if (error) {
        alert("Error removing meal: " + error.message);
    } else {
        fetchMealPlan(); // Re-fetch the meal plan for the current week
    }
};

const previousWeek = () => {
    currentDate.value = addDays(currentDate.value, -7);
};

const nextWeek = () => {
    currentWeekStart.value = addDays(currentWeekStart.value, 7);
    refresh();
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Weekly Meal Plan</h1>
        <div class="flex items-center gap-4">
            <button @click="previousWeek" class="p-2 hover:bg-gray-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span class="font-medium text-lg min-w-[200px] text-center">
                {{ format(weekDays[0].date, 'MMM d') }} - {{ format(weekDays[6].date, 'MMM d') }}
            </span>
             <button @click="nextWeek" class="p-2 hover:bg-gray-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
        </div>
    </div>

    <!-- Week Grid -->
    <div class="grid grid-cols-1 md:grid-cols-7 gap-4">
        <div v-for="day in weekDays" :key="day.iso" class="bg-gray-50 rounded-xl p-4 min-h-[300px] border border-gray-100 flex flex-col">
            <h3 class="font-bold text-gray-900 mb-4 text-center">{{ day.label }}</h3>
            
            <div class="flex-grow space-y-3">
                <div v-for="meal in getMealsForDay(day.iso)" :key="meal.id" class="bg-white p-3 rounded-lg shadow-sm text-sm group relative">
                    <span class="block font-medium truncate">{{ meal.recipe?.title || meal.custom_name }}</span>
                    <button @click="removeMeal(meal.id)" class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>

            <button @click="openAddModal(day.iso)" class="mt-4 w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-black hover:text-black transition-colors text-sm font-medium">
                + Add Meal
            </button>
        </div>
    </div>

    <!-- Add Meal Modal Overlay -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 class="text-xl font-bold mb-6">Add Meal for {{ selectedDate }}</h3>
            
            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Select Recipe</label>
                <select v-model="selectedRecipe" class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-black focus:ring-black px-4 py-3">
                    <option value="" disabled>Choose a recipe...</option>
                    <option v-for="recipe in recipes" :key="recipe.id" :value="recipe.id">
                        {{ recipe.title }}
                    </option>
                </select>
            </div>

            <div class="flex justify-end gap-3">
                <button @click="showAddModal = false" class="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium">Cancel</button>
                <button @click="addMeal" class="px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 font-medium" :disabled="!selectedRecipe">Add</button>
            </div>
        </div>
    </div>
  </div>
</template>
