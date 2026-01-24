<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <div class="h-[calc(100vh-theme('spacing.32'))]">
    <MealsWeeklyCalendar />
  </div>
</template>
