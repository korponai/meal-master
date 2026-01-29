<script setup lang="ts">
import { format, isToday } from "date-fns";
import { enUS, hu, srLatn } from "date-fns/locale";
import type { MealPlan, MealType } from "~/app/types/meal-plan";
import MealItem from "./MealItem.vue";

const props = defineProps<{
  date: string; // YYYY-MM-DD
  meals: MealPlan[];
  dailyCalorieMaximum?: number | null;
}>();

const emit = defineEmits<{
  (e: "add-meal", type: MealType): void;
  (e: "delete-meal", id: string): void;
}>();

const { locale } = useI18n();

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

const mealTypes: MealType[] = [
  "breakfast",
  "morning_snack",
  "lunch",
  "afternoon_snack",
  "dinner",
  "evening_snack",
];

const getMealsByType = (type: MealType) => {
  return props.meals.filter((m) => m.meal_type === type);
};

const dateObj = computed(() => new Date(props.date));
const isCurrentDay = computed(() => isToday(dateObj.value));

const totalCalories = computed(() => {
  return props.meals.reduce((sum, meal) => {
    // Check if recipe and nutrients exist
    const recipe = meal.recipes;
    if (!recipe || !recipe.nutrients) return sum;

    // Nutrients is Json type, so we cast/check safely
    const nutrients = recipe.nutrients as Record<string, unknown> | null;
    if (!nutrients || !nutrients.calories) return sum;

    // Handle both number (legacy/simple) and object { value, unit } formats
    const caloriesData = nutrients.calories as
      | number
      | { value: number | null }
      | null;
    let cals = 0;

    if (typeof caloriesData === "number") {
      cals = caloriesData;
    } else if (
      caloriesData &&
      typeof caloriesData === "object" &&
      "value" in caloriesData
    ) {
      cals = Number(caloriesData.value);
    }

    return sum + (isNaN(cals) ? 0 : cals);
  }, 0);
});

const isOverLimit = computed(() => {
  if (!props.dailyCalorieMaximum) return false;
  return totalCalories.value > props.dailyCalorieMaximum;
});
</script>

<template>
  <div class="flex flex-col h-full border-r border-gray-100 last:border-r-0">
    <div
      :class="[
        'p-3 text-center border-b border-gray-100 sticky top-0 z-10',
        isCurrentDay ? 'bg-blue-50' : 'bg-white',
      ]"
    >
      <div class="text-sm font-medium text-gray-500 capitalize">
        {{ format(dateObj, "EEEE", { locale: getDateLocale }) }}
      </div>
      <div class="text-lg font-bold text-gray-900 capitalize">
        {{ format(dateObj, "d MMM", { locale: getDateLocale }) }}
      </div>
      <div class="mt-1 text-xs font-semibold text-gray-400">
        {{ totalCalories > 0 ? totalCalories + " kcal" : "-" }}
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-2 space-y-4">
      <div v-for="type in mealTypes" :key="type" class="space-y-2">
        <h4
          class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
        >
          {{ $t("meal_type_" + type) }}
        </h4>

        <div class="space-y-2">
          <MealItem
            v-for="meal in getMealsByType(type)"
            :key="meal.id"
            :meal="meal"
            @delete="emit('delete-meal', $event)"
          />

          <button
            @click="emit('add-meal', type)"
            class="w-full py-1 text-xs text-center text-gray-400 border border-dashed border-gray-200 rounded hover:border-black hover:text-black transition-colors"
          >
            {{ $t("add") }}
          </button>
        </div>
      </div>
    </div>
    <div
      class="mt-auto p-2 border-t border-gray-100 text-center text-xs font-medium"
      :class="
        isOverLimit ? 'bg-red-100 text-red-800' : 'bg-gray-50 text-gray-600'
      "
    >
      {{ $t("total") }}: {{ totalCalories }} kcal
    </div>
  </div>
</template>
