<script setup lang="ts">
interface Props {
  modelValue: string;
  label?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  maxlength?: number;
}

const props = withDefaults(defineProps<Props>(), {
  rows: 4,
  disabled: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit("update:modelValue", target.value);
};

const remainingChars = computed(() => {
  if (!props.maxlength) return null;
  return props.maxlength - props.modelValue.length;
});
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :rows="rows"
      :maxlength="maxlength"
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

    <div class="mt-1 flex justify-between items-start">
      <p v-if="error" class="text-sm text-red-600">
        {{ error }}
      </p>
      <p
        v-if="maxlength && remainingChars !== null"
        class="text-xs text-gray-500 ml-auto"
      >
        {{ remainingChars }} characters remaining
      </p>
    </div>
  </div>
</template>
