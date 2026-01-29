<script setup lang="ts">
import {
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  addWeeks,
  subWeeks,
} from "date-fns";
import { enUS, hu, srLatn } from "date-fns/locale";
import DayColumn from "./DayColumn.vue";
import AddMealModal from "./AddMealModal.vue";

import type { MealType, MealPlan } from "../../types/meal-plan";
import type { Database } from "@/types/database.types";

const { locale, t } = useI18n();
const { csrf } = useCsrf();
const { fetchMealPlans, addMealPlan, deleteMealPlan } = useMealPlan();
const supabase = useSupabaseClient<Database>();

const getDateLocale = computed(() => {
  switch (locale.value) {
    case "hu":
      return hu;
    case "sr":
      return srLatn;
    default:
      return enUS;
  }
});

// State
const isMounted = ref(false);
const currentDate = ref(new Date());
const weekStart = computed(() =>
  startOfWeek(currentDate.value, { weekStartsOn: 1 }),
);
const weekEnd = computed(() =>
  endOfWeek(currentDate.value, { weekStartsOn: 1 }),
);

const weekDays = computed(() => {
  const days = [];
  let day = weekStart.value;
  for (let i = 0; i < 7; i++) {
    days.push(format(day, "yyyy-MM-dd"));
    day = addDays(day, 1);
  }
  return days;
});

const meals = ref<MealPlan[]>([]);
const loading = ref(false);
const dailyCalorieMaximum = ref<number | null>(null);

const loadMeals = async () => {
  loading.value = true;
  try {
    const start = format(weekStart.value, "yyyy-MM-dd");
    const end = format(weekEnd.value, "yyyy-MM-dd");
    meals.value = await fetchMealPlans(start, end);
  } finally {
    loading.value = false;
  }
};

const user = useSupabaseUser();

const fetchProfile = async () => {
  if (!user.value) return;
  const userId = user.value.id || user.value.sub;
  const { data } = await supabase
    .from("profiles")
    .select("daily_calorie_maximum")
    .eq("id", userId)
    .single();

  if (data) {
    dailyCalorieMaximum.value = data.daily_calorie_maximum;
  }
};

onMounted(() => {
  isMounted.value = true;
  if (user.value) {
    loadMeals();
    fetchProfile();
  }
});

watch(weekStart, loadMeals);
watch(user, (newUser) => {
  if (newUser) {
    loadMeals();
    fetchProfile();
  }
});

const getMealsForDate = (date: string) => {
  return meals.value.filter((m: MealPlan) => m.date === date);
};

// Modal State
const isModalOpen = ref(false);
const selectedDate = ref("");
const selectedMealType = ref<MealType>("breakfast");

const openAddModal = (type: MealType, date: string) => {
  selectedMealType.value = type;
  selectedDate.value = date;
  isModalOpen.value = true;
};

const handleAddMeal = async (recipeId: string) => {
  try {
    await addMealPlan({
      date: selectedDate.value,
      meal_type: selectedMealType.value,
      recipe_id: recipeId,
    });
    isModalOpen.value = false;
    await loadMeals();
  } catch (e) {
    alert("Failed to add meal");
  }
};

const handleDeleteMeal = async (id: string) => {
  if (!confirm("Remove this meal?")) return;
  try {
    await deleteMealPlan(id);
    await loadMeals();
  } catch (e) {
    alert("Failed to delete meal");
  }
};

const generatingList = ref(false);
const localePath = useLocalePath();
const generateShoppingList = async () => {
  // Confirm with user that old list will be cleared
  if (!confirm(t("shopping_list_confirm_clear_old"))) {
    return;
  }

  generatingList.value = true;
  try {
    const start = format(weekStart.value, "yyyy-MM-dd");
    const end = format(weekEnd.value, "yyyy-MM-dd");

    const { error } = await useFetch("/api/ai/generate-weekly-shopping-list", {
      method: "POST",
      headers: {
        "csrf-token": csrf,
      },
      body: { startDate: start, endDate: end },
    });

    if (error.value) {
      throw error.value;
    }

    await navigateTo(localePath("/meals/shoppinglist"));
  } catch (error) {
    console.error("Failed to generate list:", error);
    alert(t("shopping_list_generate_error"));
  } finally {
    generatingList.value = false;
  }
};
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Toolbar -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-4">
        <h2 class="text-xl font-bold text-gray-900">
          {{ $t("meal_planner_title") }}
        </h2>

        <button
          @click="generateShoppingList"
          :disabled="!isMounted || generatingList || meals.length === 0"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-sm"
        >
          <svg
            v-if="generatingList"
            class="animate-spin h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span v-else>✨</span>
          {{ $t("generate_shopping_list") }}
        </button>

        <div
          class="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1"
        >
          <button
            @click="currentDate = subWeeks(currentDate, 1)"
            class="p-1 hover:bg-gray-100 rounded text-gray-600"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span
            class="text-sm font-medium px-2 min-w-[140px] text-center capitalize"
          >
            {{ format(weekStart, "MMM d", { locale: getDateLocale }) }} -
            {{ format(weekEnd, "MMM d", { locale: getDateLocale }) }}
          </span>
          <button
            @click="currentDate = addWeeks(currentDate, 1)"
            class="p-1 hover:bg-gray-100 rounded text-gray-600"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        <button
          @click="currentDate = new Date()"
          class="text-sm font-medium text-black hover:underline"
        >
          {{ $t("today") }}
        </button>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div
      class="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto relative"
    >
      <div
        v-if="loading"
        class="absolute inset-0 bg-white/50 z-20 flex items-center justify-center"
      >
        <span class="text-sm font-medium text-gray-500">Loading...</span>
      </div>
      <!-- Inner grid wrapper - uses CSS Grid for equal height columns -->
      <div class="grid grid-cols-7 min-w-[980px] h-full">
        <DayColumn
          v-for="date in weekDays"
          :key="date"
          :date="date"
          :meals="getMealsForDate(date)"
          :dailyCalorieMaximum="dailyCalorieMaximum"
          @add-meal="openAddModal($event, date)"
          @delete-meal="handleDeleteMeal"
        />
      </div>
    </div>

    <AddMealModal
      :isOpen="isModalOpen"
      :date="selectedDate"
      :mealType="selectedMealType"
      @close="isModalOpen = false"
      @add="handleAddMeal"
    />
  </div>
</template>
