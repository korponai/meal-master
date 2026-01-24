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

import type { MealType, MealPlan } from "~/app/types/meal-plan";

const { locale } = useI18n();
const { fetchMealPlans, addMealPlan, deleteMealPlan } = useMealPlan();

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

onMounted(loadMeals);

watch(weekStart, loadMeals);

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
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Toolbar -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-4">
        <h2 class="text-xl font-bold text-gray-900">
          {{ $t("meal_planner_title") }}
        </h2>
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
      class="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto flex min-h-[600px]"
    >
      <div
        v-if="loading"
        class="absolute inset-0 bg-white/50 z-20 flex items-center justify-center"
      >
        <span class="text-sm font-medium text-gray-500">Loading...</span>
      </div>
      <DayColumn
        v-for="date in weekDays"
        :key="date"
        :date="date"
        :meals="getMealsForDate(date)"
        @add-meal="openAddModal($event, date)"
        @delete-meal="handleDeleteMeal"
      />
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
