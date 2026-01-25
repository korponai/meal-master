<script setup lang="ts">
interface NutritionValue {
  value: number | null;
  unit: string;
}

interface Nutrition {
  calories?: NutritionValue;
  protein?: NutritionValue;
  carbohydrates?: NutritionValue;
  fat?: NutritionValue;
  water?: NutritionValue;
  cholesterol?: NutritionValue;
  dietaryFiber?: NutritionValue;
  sugar?: NutritionValue;
}

const props = defineProps<{
  nutrition: Nutrition | null | undefined;
}>();

const { t } = useI18n();

// Define the order and keys for display
const nutritionKeys = [
  { key: "calories", colorClass: "text-orange-600" },
  { key: "protein", colorClass: "text-blue-600" },
  { key: "carbohydrates", colorClass: "text-yellow-600" },
  { key: "fat", colorClass: "text-purple-600" },
  { key: "water", colorClass: "text-cyan-600" },
  { key: "cholesterol", colorClass: "text-pink-600" },
  { key: "dietaryFiber", colorClass: "text-green-600" },
  { key: "sugar", colorClass: "text-red-600" },
] as const;

const getNutritionValue = (key: string): NutritionValue | undefined => {
  if (!props.nutrition) return undefined;
  return (props.nutrition as Record<string, NutritionValue | undefined>)[key];
};

const formatValue = (item: NutritionValue | undefined): string => {
  if (!item || item.value === null || item.value === undefined) {
    return "-";
  }
  return `${item.value}${item.unit}`;
};

const hasNutritionData = computed(() => {
  if (!props.nutrition) return false;
  return nutritionKeys.some((nk) => {
    const val = getNutritionValue(nk.key);
    return val && val.value !== null && val.value !== undefined;
  });
});
</script>

<template>
  <div v-if="hasNutritionData" class="border border-gray-200 rounded-lg p-4">
    <h4 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
      {{ t("nutrition_title") }}
    </h4>
    <div class="grid grid-cols-4 sm:grid-cols-8 gap-2">
      <div
        v-for="nk in nutritionKeys"
        :key="nk.key"
        class="flex flex-col items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
      >
        <span class="text-lg font-bold text-gray-900">
          {{ formatValue(getNutritionValue(nk.key)) }}
        </span>
        <span class="text-xs mt-1" :class="nk.colorClass">
          {{ t(`nutrition_${nk.key}`) }}
        </span>
      </div>
    </div>
  </div>
</template>
