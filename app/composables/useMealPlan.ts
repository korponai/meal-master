import type { Database } from "../types/database.types";
import type { MealPlan, MealType } from "../types/meal-plan";

export const useMealPlan = () => {
  const supabase = useSupabaseClient<Database>();
  const { getUserId } = useAuth();

  const fetchMealPlans = async (startDate: string, endDate: string) => {
    try {
      const userId = getUserId();

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
    } catch (error: unknown) {
      console.error("Error in fetchMealPlans:", error);
      return [];
    }
  };

  const addMealPlan = async (meal: {
    date: string;
    meal_type: MealType;
    recipe_id: string;
    custom_name?: string;
  }) => {
    try {
      const userId = getUserId();

      const payload = {
        user_id: userId,
        date: meal.date,
        meal_type: meal.meal_type,
        recipe_id: meal.recipe_id,
        custom_name: meal.custom_name || null,
      };

      const { data, error } = await supabase
        .from("meal_plans")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("Error adding meal plan:", error);
        throw error;
      }

      const newMealPlan = data as MealPlan;

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
    } catch (error: unknown) {
      console.error("Error in addMealPlan:", error);
      throw error;
    }
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
