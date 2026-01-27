import type { Database } from "../types/database.types";
import type { MealPlan, MealType } from "../types/meal-plan";

/**
 * Composable for managing meal plans
 * Provides CRUD operations for user meal planning
 *
 * @returns Object with meal plan functions and reactive state
 */
export const useMealPlan = () => {
  const supabase = useSupabaseClient<Database>();
  const { getUserId } = useAuth();

  // Reactive state for UI feedback
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Fetch meal plans for a specific date range
   *
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   * @returns Array of meal plans with joined recipe data
   */
  const fetchMealPlans = async (startDate: string, endDate: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      const userId = getUserId();

      const { data, error: fetchError } = await supabase
        .from("meal_plans")
        .select("*, recipes(*)")
        .eq("user_id", userId)
        .gte("date", startDate)
        .lte("date", endDate);

      if (fetchError) {
        error.value = fetchError.message;
        throw fetchError;
      }

      return data as MealPlan[];
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch meal plans";
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Add a new meal to the plan
   *
   * @param meal - Meal plan data including date, type, and recipe
   * @returns Created meal plan with joined recipe data
   */
  const addMealPlan = async (meal: {
    date: string;
    meal_type: MealType;
    recipe_id: string;
    custom_name?: string;
  }) => {
    isLoading.value = true;
    error.value = null;

    try {
      const userId = getUserId();

      const payload = {
        user_id: userId,
        date: meal.date,
        meal_type: meal.meal_type,
        recipe_id: meal.recipe_id,
        custom_name: meal.custom_name || null,
      };

      const { data, error: insertError } = await supabase
        .from("meal_plans")
        .insert(payload)
        .select()
        .single();

      if (insertError) {
        error.value = insertError.message;
        throw insertError;
      }

      const newMealPlan = data as MealPlan;

      // Re-fetch with joined recipe data
      const { data: refetchedData, error: fetchError } = await supabase
        .from("meal_plans")
        .select("*, recipes(*)")
        .eq("id", newMealPlan.id)
        .single();

      if (fetchError) {
        // Return without recipe join if refetch fails
        return newMealPlan;
      }

      return refetchedData as MealPlan;
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : "Failed to add meal plan";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Delete a meal plan by ID
   *
   * @param id - Meal plan ID to delete
   */
  const deleteMealPlan = async (id: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabase
        .from("meal_plans")
        .delete()
        .eq("id", id);

      if (deleteError) {
        error.value = deleteError.message;
        throw deleteError;
      }
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete meal plan";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    fetchMealPlans,
    addMealPlan,
    deleteMealPlan,
    isLoading: readonly(isLoading),
    error: readonly(error),
  };
};
