<script setup lang="ts">
import type { InputHTMLAttributes } from "vue";

interface Props {
  modelValue: string;
  label?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "url";
  disabled?: boolean;
  autocomplete?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  disabled: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
};
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :autocomplete="autocomplete"
      :class="[
        'mt-1 block w-full rounded-md shadow-sm transition-colors',
        'focus:ring-2 focus:ring-offset-0 outline-none',
        error
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
          : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
        disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
      ]"
      @input="handleInput"
    />

    <p v-if="error" class="mt-1 text-sm text-red-600">
      {{ error }}
    </p>
  </div>
</template>
