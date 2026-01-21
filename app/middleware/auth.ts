export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser();

  if (!user.value) {
    return navigateTo(useLocalePath()("/login")); // Redirect to login if not authenticated
  }
});
