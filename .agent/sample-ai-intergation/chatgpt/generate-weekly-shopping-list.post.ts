import OpenAI from "openai";
import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~~/types/database.types";

const openai = new OpenAI({
  apiKey: process.env.CHATGPT_API_KEY,
});

export default defineEventHandler(async (event) => {
  const { startDate, endDate } = await readBody(event);
  const client = await serverSupabaseClient<Database>(event);

  // 1. Fetch Meal Plans for the range
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
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

  // 2. Aggregate Ingredients
  const rawIngredients = [];
  for (const meal of mealPlans) {
    if (meal.recipes && meal.recipes.recipe_ingredients) {
      for (const ri of meal.recipes.recipe_ingredients) {
        if (ri.ingredients && ri.ingredients.name) {
          rawIngredients.push({
            name: ri.ingredients.name,
            quantity: ri.quantity,
            unit: ri.unit,
            recipe: meal.recipes.title,
          });
        }
      }
    }
  }

  if (rawIngredients.length === 0) {
    return { items: [] };
  }

  // 3. AI Processing (Deduplication & Categorization)
  const prompt = `
    You are a smart kitchen assistant. I will provide a list of ingredients from various recipes.
    Your task is to:
    1. Consolidate duplicates (e.g., sum up "2 onions" and "1 onion").
    2. Normalize units where appropriate (e.g. convert all to metric or standard, but keep it simple).
    3. Categorize each item into one of the following groups:
       - "Produce" (Fruits, Vegetables, Herbs)
       - "Dairy" (Milk, Cheese, Eggs, Yogurt)
       - "Meat" (Meat, Poultry, Fish)
       - "Bakery" (Bread, Pastries)
       - "Pantry" (Spices, Oils, Canned goods, Grains, Pasta)
       - "Frozen" (Frozen foods)
       - "Household" (Cleaning, etc.)
       - "Other" (Everything else)
    
    Return a JSON object with a key "shopping_list" containing an array of items.
    Each item must have:
    - name: string (clean name)
    - quantity: number (total amount)
    - unit: string (unit of measure)
    - category: string (one of the above)

    Input Ingredients:
    ${JSON.stringify(rawIngredients, null, 2)}
  `;

  const completion = await openai.chat.completions.create({
    model: process.env.CHATGPT_RECIPE_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant that processes shopping lists." },
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

  // 4. Save to Database
  const itemsToInsert = processedItems.map((item: any) => ({
    user_id: user.id,
    item_name: item.name,
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
