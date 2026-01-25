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

  if (!config.openaiApiKey) {
    throw createError({
      statusCode: 500,
      message: "OpenAI API key is not configured",
    });
  }

  const body = await readBody(event);
  const { sensitivities, customFocus } = requestSchema.parse(body);

  const prompt = generatePrompt(sensitivities, customFocus);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a chef assistant. You generate healthy recipes with detailed nutritional information. Always respond in exactly the specified JSON format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8,
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
- You MUST provide ALL nutritional data (calories, protein, carbs, fat)!
- Do NOT generate a simple salad unless specifically requested!
- Choose a diverse food category: main dish, soup, one-pot meal, roasted meat, casserole/stuffed dish, pasta dish, oven-baked dish.
- The recipe should be easy to prepare, maximum 45 minutes.`;

  // Add custom focus if provided
  if (customFocus && customFocus.trim()) {
    prompt += `

**VERY IMPORTANT - User request:**
${customFocus.trim()}
Be sure to take this request into account when generating the recipe! The main theme and focus of the recipe should align with the user's request.`;
  }

  prompt += `

**Respond in EXACTLY this JSON format:**
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
    "First step description",
    "Second step description"
  ]
}`;

  if (sensitivities.length > 0) {
    const sensitivityMap: Record<string, string> = {
      lactose: "lactose (dairy products)",
      gluten: "gluten (wheat, barley, rye)",
      egg: "eggs",
      nuts: "peanuts and tree nuts",
      soy: "soy",
      fish: "fish and seafood",
      milk_protein: "milk protein (all dairy products)",
      histamine: "high histamine foods (aged cheeses, fermented foods)",
      fructose: "high fructose foods",
    };

    const avoidList = sensitivities
      .map((s) => sensitivityMap[s] || s)
      .join(", ");

    prompt += `\n\n**IMPORTANT - Food sensitivities to consider:**\nDo NOT use the following ingredients: ${avoidList}.`;
  }

  return prompt;
}
