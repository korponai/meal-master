import type { Database } from "../types/database.types";
import type { MealPlan, MealType } from "../types/meal-plan";

export const useMealPlan = () => {
  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();

  const fetchMealPlans = async (startDate: string, endDate: string) => {
    const userId = user.value?.id || user.value?.sub;

    if (!userId || userId === "undefined" || userId === "null") {
      console.log("fetchMealPlans: Invalid user ID, returning empty list.");
      return [];
    }

    const { data, error } = await supabase
      .from("meal_plans")
      .select("*, recipes(*)")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate);

    if (error) {
      console.error("Error fetching meal plans:", error);
      throw error;
    }

    return data as MealPlan[];
  };

  const addMealPlan = async (meal: {
    date: string;
    meal_type: MealType;
    recipe_id: string;
    custom_name?: string;
  }) => {
    if (!user.value) return null;

    const userId = user.value.id || user.value.sub;
    if (!userId || userId === "undefined") {
      console.error("User ID not found or invalid in useMealPlan");
      throw new Error("User ID missing");
    }

    const payload = {
      user_id: userId,
      date: meal.date,
      meal_type: meal.meal_type,
      recipe_id: meal.recipe_id,
      custom_name: meal.custom_name,
    };

    // Initial insert
    const { data, error } = await supabase
      .from("meal_plans")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Error adding meal plan:", error);
      throw error;
    }

    // Capture the new ID
    const newMealPlan = data as MealPlan;

    // We can fetch the recipe details separately or assume we have them
    // For now, let's just return what we have, or re-fetch if needed.
    // To match the type, we might need the recipe structure.
    // Let's re-fetch the single row with join if insert succeeded.

    const { data: refetchedData, error: fetchError } = await supabase
      .from("meal_plans")
      .select("*, recipes(*)")
      .eq("id", newMealPlan.id)
      .single();

    if (fetchError) {
      console.warn("Could not refetch details with join:", fetchError);
      return newMealPlan;
    }

    return refetchedData as MealPlan;
  };

  const deleteMealPlan = async (id: string) => {
    const { error } = await supabase.from("meal_plans").delete().eq("id", id);

    if (error) {
      console.error("Error deleting meal plan:", error);
      throw error;
    }
  };

  return {
    fetchMealPlans,
    addMealPlan,
    deleteMealPlan,
  };
};
