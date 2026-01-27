import { z } from "zod";

const requestSchema = z.object({
  recipeTitle: z.string().min(1),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.number(),
      unit: z.string(),
    }),
  ),
  servingSize: z.number().optional().default(1),
});

interface NutritionValue {
  value: number | null;
  unit: string;
}

interface GeneratedNutrition {
  nutrition: {
    calories: NutritionValue;
    protein: NutritionValue;
    carbohydrates: NutritionValue;
    fat: NutritionValue;
    water: NutritionValue;
    cholesterol: NutritionValue;
    dietaryFiber: NutritionValue;
    sugar: NutritionValue;
  };
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  if (!config.chatgptApiKey) {
    throw createError({
      statusCode: 500,
      message: "ChatGPT API key is not configured",
    });
  }

  const body = await readBody(event);
  const { recipeTitle, ingredients, servingSize } = requestSchema.parse(body);

  const prompt = generatePrompt(recipeTitle, ingredients, servingSize);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.chatgptApiKey}`,
      },
      body: JSON.stringify({
        model: config.chatgptRecipeModel || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a nutrition expert assistant. Based on the given recipe and ingredients, you calculate nutritional values. Always respond in the exact JSON format specified. If you cannot determine a value, use null.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API Error:", error);
      throw createError({
        statusCode: response.status,
        message: error.error?.message || "OpenAI API error",
      });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw createError({
        statusCode: 500,
        message: "No response from OpenAI",
      });
    }

    const nutrition: GeneratedNutrition = JSON.parse(content);

    return nutrition;
  } catch (error: unknown) {
    console.error("Error generating nutrition:", error);
    if (typeof error === "object" && error !== null && "statusCode" in error) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: "Failed to generate nutrition data",
    });
  }
});

function generatePrompt(
  recipeTitle: string,
  ingredients: { name: string; quantity: number; unit: string }[],
  servingSize: number,
): string {
  const ingredientsList = ingredients
    .map((ing) => `- ${ing.quantity} ${ing.unit} ${ing.name}`)
    .join("\n");

  return `Calculate the nutritional values for the following recipe:

**Recipe name:** ${recipeTitle}
**Servings:** ${servingSize} serving(s)

**Ingredients:**
${ingredientsList}

**IMPORTANT:** Calculate the nutritional values PER SERVING!

**Respond in EXACTLY this JSON format:**
{
  "nutrition": {
    "calories": {
      "value": 279,
      "unit": "kcal"
    },
    "protein": {
      "value": 13.5,
      "unit": "g"
    },
    "carbohydrates": {
      "value": 30,
      "unit": "g"
    },
    "fat": {
      "value": 9.4,
      "unit": "g"
    },
    "water": {
      "value": 45.5,
      "unit": "g"
    },
    "cholesterol": {
      "value": 217,
      "unit": "mg"
    },
    "dietaryFiber": {
      "value": 2.5,
      "unit": "g"
    },
    "sugar": {
      "value": 29.4,
      "unit": "g"
    }
  }
}

If you cannot determine a value precisely, use null for the value field.`;
}
