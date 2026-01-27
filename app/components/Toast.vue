<script setup lang="ts">
const { toasts, removeToast } = useToast();

const getToastClasses = (type: string) => {
  const baseClasses =
    "flex items-center gap-3 p-4 rounded-xl shadow-lg min-w-[300px] max-w-md";

  switch (type) {
    case "success":
      return `${baseClasses} bg-green-50 border border-green-200 text-green-800`;
    case "error":
      return `${baseClasses} bg-red-50 border border-red-200 text-red-800`;
    case "warning":
      return `${baseClasses} bg-yellow-50 border border-yellow-200 text-yellow-800`;
    default:
      return `${baseClasses} bg-blue-50 border border-blue-200 text-blue-800`;
  }
};

const getIcon = (type: string) => {
  switch (type) {
    case "success":
      return "✓";
    case "error":
      return "✕";
    case "warning":
      return "⚠";
    default:
      return "ℹ";
  }
};
</script>

<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="getToastClasses(toast.type)"
      >
        <span class="text-xl font-bold">{{ getIcon(toast.type) }}</span>
        <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>
        <button
          @click="removeToast(toast.id)"
          class="text-current opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
