<script setup lang="ts">
import type { Database } from "@/types/database.types";

type Ingredient = Database["public"]["Tables"]["ingredients"]["Row"];

export interface RecipeIngredient {
  ingredient: Ingredient | null;
  quantity: number | null;
  unit: string;
}

const props = defineProps<{
  modelValue: RecipeIngredient;
  index: number;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: RecipeIngredient): void;
  (e: "remove", index: number): void;
}>();

const units = [
  "teaspoon",
  "tablespoon",
  "cup",
  "pint",
  "milliliter",
  "liter",
  "gram",
  "kilogram",
  "pinch",
  "by_count",
] as const;

const update = (field: keyof RecipeIngredient, value: any) => {
  emit("update:modelValue", { ...props.modelValue, [field]: value });
};
</script>

<template>
  <div class="flex items-end gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
    <div class="flex-1">
        <label v-if="index === 0" class="block text-xs font-medium text-gray-500 mb-1">{{ $t('ingredients_label') }}</label>
        <RecipesIngredientSelector
            :model-value="modelValue.ingredient || undefined"
            @update:model-value="update('ingredient', $event)" 
        />
    </div>
    
    <div class="w-24">
        <label v-if="index === 0" class="block text-xs font-medium text-gray-500 mb-1">{{ $t('quantity_label') }}</label>
        <input 
            type="number" 
            min="0"
            step="0.1"
            :value="modelValue.quantity"
            @input="update('quantity', parseFloat(($event.target as HTMLInputElement).value))"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
            placeholder="Qty"
        />
    </div>

    <div class="w-32">
        <label v-if="index === 0" class="block text-xs font-medium text-gray-500 mb-1">{{ $t('unit_label') }}</label>
        <select
            :value="modelValue.unit"
            @change="update('unit', ($event.target as HTMLSelectElement).value)"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 bg-white"
        >
            <option value="" disabled>{{ $t('unit_label') }}</option>
            <option v-for="unit in units" :key="unit" :value="unit">
                {{ $t('unit_' + unit.toLowerCase()) }}
            </option>
        </select>
    </div>

    <button 
        type="button" 
        @click="emit('remove', index)"
        class="text-red-500 hover:text-red-700 p-2 mb-[1px]"
        title="Remove ingredient"
    >
        ✕
    </button>
  </div>
</template>
