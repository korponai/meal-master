import { z } from "zod";

const requestSchema = z.object({
  sensitivities: z.array(z.string()).optional().default([]),
  customFocus: z.string().optional(),
});

interface GeneratedRecipe {
  title: string;
  ingredients: { name: string; quantity: number; unit: string }[];
  servingSize: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  steps: string[];
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  if (!config.geminiApiKey) {
    throw createError({
      statusCode: 500,
      message: "Gemini API key is not configured",
    });
  }

  const body = await readBody(event);
  const { sensitivities, customFocus } = requestSchema.parse(body);

  const prompt = generatePrompt(sensitivities, customFocus);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro:generateContent?key=${config.geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          system_instruction: {
            parts: [
              {
                text: "You are an English chef assistant. You generate healthy recipes with detailed nutritional data. Always respond exactly in the provided JSON format.",
              },
            ],
          },
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.8,
          },
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      throw createError({
        statusCode: response.status,
        message: data.error?.message || "Gemini API error",
      });
    }

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw createError({
        statusCode: 500,
        message: "No response from Gemini",
      });
    }

    const recipe: GeneratedRecipe = JSON.parse(content);

    return { recipe };
  } catch (error: any) {
    console.error("Error generating recipe:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: "Failed to generate recipe",
    });
  }
});

function generatePrompt(sensitivities: string[], customFocus?: string): string {
  let prompt = `Generate 1 healthy recipe.

**Important rules:**
- ALL nutritional data is MANDATORY (calories, protein, carbs, fat)!
- DO NOT generate a simple salad unless specifically requested!
- Choose a variety of food categories: main course, soup, one-pot meal, roast meat, casserole/stuffed dish, pasta dish, oven-baked dish.
- The recipe should be easy to prepare, in 45 minutes max.`;

  // Add custom focus if provided
  if (customFocus && customFocus.trim()) {
    prompt += `

**EXTREMELY IMPORTANT - User's request:**
${customFocus.trim()}
Be sure to take this request into account when generating the recipe! The main theme and focus of the recipe should be in line with the user's request.`;
  }

  prompt += `

**Respond EXACTLY in this JSON format:**
{
  "title": "Recipe name",
  "ingredients": [
    {"name": "Ingredient name", "quantity": 100, "unit": "g"}
  ],
  "servingSize": 350,
  "nutrition": {
    "calories": 450,
    "protein": 25,
    "carbs": 40,
    "fat": 15
  },
  "steps": [
    "Description of the first step",
    "Description of the second step"
  ]
}`;

  if (sensitivities.length > 0) {
    const sensitivityMap: Record<string, string> = {
      lactose: "lactose (dairy products)",
      gluten: "gluten (wheat, barley, rye)",
      egg: "egg",
      nuts: "nuts and seeds",
      soy: "soy",
      fish: "fish and seafood",
      milk_protein: "milk protein (all dairy products)",
      histamine: "high histamine foods (aged cheeses, fermented foods)",
      fructose: "high fructose foods",
    };

    const avoidList = sensitivities
      .map((s) => sensitivityMap[s] || s)
      .join(", ");

    prompt += `\n\n**IMPORTANT - Sensitivity considerations:**\nDO NOT use the following ingredients: ${avoidList}.`;
  }

  return prompt;
}
