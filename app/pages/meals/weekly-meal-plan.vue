<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <div class="min-h-0 flex-1">
    <MealsWeeklyCalendar />
  </div>
</template>
