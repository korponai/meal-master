import OpenAI from "openai";
import { z } from "zod";
import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~~/app/types/database.types";

const openai = new OpenAI({
  apiKey: process.env.CHATGPT_API_KEY,
});

/**
 * Partial ingredient mapping - maps partial/derived ingredients to their whole form
 * e.g., "egg white" and "egg yolk" should both count as whole eggs
 */
const PARTIAL_INGREDIENT_MAP: Record<string, string> = {
  "egg white": "egg",
  "egg whites": "egg",
  "egg yolk": "egg",
  "egg yolks": "egg",
  "chicken breast": "chicken breast",
  "chicken thigh": "chicken thigh",
  "chicken leg": "chicken leg",
  "chicken wing": "chicken wing",
};

/**
 * Normalizes an ingredient name for consistent matching
 */
function normalizeIngredientName(name: string): string {
  // Lowercase and trim
  let normalized = name.toLowerCase().trim();
  
  // Check if it's a partial ingredient that should be mapped to whole
  if (PARTIAL_INGREDIENT_MAP[normalized]) {
    normalized = PARTIAL_INGREDIENT_MAP[normalized];
  }
  
  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, " ");
  
  return normalized;
}

/**
 * Creates a unique key for aggregating ingredients
 * Ingredients with same normalized name AND same unit can be merged
 */
function createIngredientKey(name: string, unit: string | null): string {
  const normalizedName = normalizeIngredientName(name);
  const normalizedUnit = (unit || "piece").toLowerCase().trim();
  return `${normalizedName}|${normalizedUnit}`;
}

interface AggregatedIngredient {
  name: string;
  quantity: number;
  unit: string;
  originalNames: string[]; // Track original names for AI context
}

/**
 * Pre-aggregates ingredients before sending to AI
 * This ensures deterministic merging of same ingredients
 */
function preAggregateIngredients(
  rawIngredients: Array<{ name: string; quantity: number | null; unit: string | null }>
): AggregatedIngredient[] {
  const aggregated = new Map<string, AggregatedIngredient>();

  for (const ingredient of rawIngredients) {
    const key = createIngredientKey(ingredient.name, ingredient.unit);
    const normalizedName = normalizeIngredientName(ingredient.name);
    const quantity = ingredient.quantity ?? 1;
    const unit = (ingredient.unit || "piece").toLowerCase().trim();

    if (aggregated.has(key)) {
      const existing = aggregated.get(key)!;
      existing.quantity += quantity;
      if (!existing.originalNames.includes(ingredient.name)) {
        existing.originalNames.push(ingredient.name);
      }
    } else {
      aggregated.set(key, {
        name: normalizedName,
        quantity: quantity,
        unit: unit,
        originalNames: [ingredient.name],
      });
    }
  }

  return Array.from(aggregated.values());
}

export default defineEventHandler(async (event) => {
  const bodySchema = z.object({
    startDate: z.string().date(),
    endDate: z.string().date(),
  });

  const { startDate, endDate } = await readValidatedBody(event, (body) =>
    bodySchema.parse(body)
  );
  const client = await serverSupabaseClient<Database>(event);

  // 1. Fetch Meal Plans for the range
  let user;
  try {
    const { data, error } = await client.auth.getUser();
    if (error || !data?.user) {
      console.error("Auth error:", error?.message);
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }
    user = data.user;
  } catch (err: any) {
    // If the error is already a H3Error (from createError), rethrow it
    if (err.statusCode) throw err;
    
    // Otherwise it's likely the "Refresh Token Not Found" or similar from Supabase
    console.error("Unexpected auth error:", err.message);
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: Session invalid",
    });
  }

  const { data: mealPlans, error: mealError } = await client
    .from("meal_plans")
    .select(`
      id,
      date,
      recipes (
        id,
        title,
        recipe_ingredients (
          quantity,
          unit,
          ingredients (
            name
          )
        )
      )
    `)
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate);

  if (mealError) {
    throw createError({
      statusCode: 500,
      statusMessage: mealError.message,
    });
  }

  if (!mealPlans || mealPlans.length === 0) {
    return { items: [] };
  }

  // 2. Collect raw ingredients from all recipes
  const rawIngredients: Array<{ name: string; quantity: number | null; unit: string | null }> = [];
  for (const meal of mealPlans) {
    if (meal.recipes && meal.recipes.recipe_ingredients) {
      for (const ri of meal.recipes.recipe_ingredients) {
        if (ri.ingredients && ri.ingredients.name) {
          rawIngredients.push({
            name: ri.ingredients.name,
            quantity: ri.quantity,
            unit: ri.unit,
          });
        }
      }
    }
  }

  if (rawIngredients.length === 0) {
    return { items: [] };
  }

  // 3. Pre-aggregate ingredients before AI processing
  // This ensures deterministic merging of same ingredients
  const aggregatedIngredients = preAggregateIngredients(rawIngredients);

  // 4. AI Processing (ONLY Categorization - merging is already done)
  const prompt = `
    You are a smart kitchen assistant. I will provide a list of pre-aggregated ingredients.
    The ingredients have ALREADY been merged and quantities summed - do NOT change the quantities.
    
    Your ONLY task is to:
    1. Clean up the ingredient name if needed (capitalize properly, fix typos, translate to english)
    2. Merge same ingredients (e.g. "apple" and "apple, 2" should be merged into "apple, 3")
    3. Merge same ingredients with different units (e.g. "apple, 1 piece" and "apple, 2 pieces" should be merged into "apple, 3 pieces")
    4. Merge same ingredients with different unit of measurement (e.g. "olive oil, 15 gram" and "olive oil, 2 tablespoons" should be merged into "olive oil, 3 tablespoons")
    5. Merge the piece of the ingredient if it can't be bought separately (e.g. "egg white, 1" and "egg yolk, 1" and egg, 1" should be merged into "egg, 3 pieces")
    6. Categorize each item into one of the following groups:
       - "Produce" (Fruits, Vegetables, Herbs)
       - "Dairy" (Milk, Cheese, Eggs, Yogurt)
       - "Meats" (Meat, Poultry, Fish)
       - "Bakery" (Bread, Pastries)
       - "Pantry" (Spices, Oils, Canned goods, Grains, Pasta)
       - "Frozen" (Frozen foods)
       - "Household" (Cleaning, etc.)
       - "Other" (Everything else)
    
    Return a JSON object with a key "shopping_list" containing an array of items.
    Each item must have:
    - name: string (properly formatted name)
    - quantity: number (KEEP THE EXACT quantity provided)
    - unit: string (KEEP THE EXACT unit provided)
    - category: string (one of the above categories)

    Input Ingredients (already aggregated):
    ${JSON.stringify(aggregatedIngredients.map(i => ({ name: i.name, quantity: i.quantity, unit: i.unit })), null, 2)}
  `;

  const completion = await openai.chat.completions.create({
    model: process.env.CHATGPT_RECIPE_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant that categorizes shopping list items. Do not modify quantities or merge items - only categorize and format names." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });

  const responseContent = completion.choices[0].message.content;
  if (!responseContent) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to generate shopping list from AI.",
    });
  }

  const result = JSON.parse(responseContent);
  const processedItems = result.shopping_list;

  // 5. Delete existing shopping list items for this user before inserting new ones
  const { error: deleteError } = await client
    .from("shopping_list_items")
    .delete()
    .eq("user_id", user.id);

  if (deleteError) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to clear old shopping list: ${deleteError.message}`,
    });
  }

  // 6. Save new items to Database
  const itemsToInsert = processedItems.map((item: any) => ({
    user_id: user.id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    category: item.category,
    is_checked: false,
  }));

  const { error: insertError } = await client
    .from("shopping_list_items")
    .insert(itemsToInsert);

  if (insertError) {
    throw createError({
      statusCode: 500,
      statusMessage: insertError.message,
    });
  }

  return { success: true, count: itemsToInsert.length };
});
