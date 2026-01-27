<script setup lang="ts">
interface Option {
  value: string | number;
  label: string;
}

interface Props {
  modelValue: string | number;
  label?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  options: Option[];
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  placeholder: "Select an option...",
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number];
}>();

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const value = target.value;

  // Convert back to number if the option value is numeric
  const numValue = Number(value);
  emit("update:modelValue", isNaN(numValue) ? value : numValue);
};
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <select
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :class="[
        'mt-1 block w-full rounded-md shadow-sm transition-colors',
        'focus:ring-2 focus:ring-offset-0 outline-none',
        error
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
          : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
        disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
      ]"
      @change="handleChange"
    >
      <option value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <p v-if="error" class="mt-1 text-sm text-red-600">
      {{ error }}
    </p>
  </div>
</template>
