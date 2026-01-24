import type { Database } from "~/app/types/database.types";
import type { MealPlan, MealType } from "~/app/types/meal-plan";

export const useMealPlan = () => {
  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();

  const fetchMealPlans = async (startDate: string, endDate: string) => {
    if (!user.value) return [];

    const { data, error } = await supabase
      .from("meal_plans")
      .select("*, recipes(*)")
      .eq("user_id", user.value.id)
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

    const { data, error } = await supabase
      .from("meal_plans")
      .insert({
        user_id: user.value.id,
        date: meal.date,
        meal_type: meal.meal_type,
        recipe_id: meal.recipe_id,
        custom_name: meal.custom_name,
      })
      .select("*, recipes(*)")
      .single();

    if (error) {
      console.error("Error adding meal plan:", error);
      throw error;
    }

    return data as MealPlan;
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
