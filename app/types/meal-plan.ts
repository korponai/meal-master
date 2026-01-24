import type { Database } from "./database.types";

export type MealType =
  | "breakfast"
  | "morning_snack"
  | "lunch"
  | "afternoon_snack"
  | "dinner"
  | "evening_snack";

export type MealPlan = Database["public"]["Tables"]["meal_plans"]["Row"] & {
  recipes?: Database["public"]["Tables"]["recipes"]["Row"] | null;
};

export interface DayPlan {
  date: string; // YYYY-MM-DD
  meals: {
    [key in MealType]?: MealPlan[];
  };
}
