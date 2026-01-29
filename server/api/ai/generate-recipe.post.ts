import { z } from "zod";
import { AI_CONFIG } from "~/constants/ai";
import { logger } from "~/utils/logger";

const requestSchema = z.object({
  sensitivities: z.array(z.string()).optional().default([]),
  customFocus: z.string().optional(),
  language: z.string().optional().default("en"),
});

interface GeneratedRecipe {
  title: string;
  description: string;
  category: "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Dessert";
  ingredients: { name: string; quantity: number; unit: string }[];
  allergens: string[];
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  if (!config.chatgptApiKey) {
    throw createError({
      statusCode: 500,
      message: "OpenAI API key is not configured",
    });
  }

  const body = await readBody(event);
  const { sensitivities, customFocus, language } = requestSchema.parse(body);

  const prompt = generatePrompt(sensitivities, customFocus, language);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.chatgptApiKey}`,
      },
      body: JSON.stringify({
        model: config.chatgptRecipeModel,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful chef assistant. You generate healthy, delicious recipes with detailed nutritional awareness. Always respond in the exact JSON format specified.",
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
      logger.error("OpenAI API Error", error);
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
  } catch (error: unknown) {
    logger.error("Error generating recipe", error);

    // Handle H3 errors
    if (typeof error === "object" && error !== null && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: "Failed to generate recipe",
    });
  }
});

function generatePrompt(
  sensitivities: string[],
  customFocus?: string,
  language: string = "en",
): string {
  const sensitivityMap: Record<string, string> = {
    lactose: "lactose (dairy products)",
    gluten: "gluten (wheat, barley, rye)",
    egg: "eggs",
    peanut: "peanuts and tree nuts",
    soy: "soy products",
    fish: "fish and seafood",
    milk_protein: "milk protein (all dairy)",
    histamine: "high-histamine foods (aged cheese, fermented foods)",
    fructose: "high-fructose foods",
  };

  const languageMap: Record<string, string> = {
    en: "English",
    hu: "Hungarian",
    sr: "Serbian",
  };
  const targetLanguage = languageMap[language] || "English";

  let prompt = `Generate 1 healthy recipe.

**Language Rules:**
- The content (Title, Description, Ingredient Names) MUST be in ${targetLanguage}.
- The JSON keys and enum values (category, unit, allergens) MUST remain in English as specified below.

**Important rules:**
- Include ALL nutritional considerations
- Choose a varied meal category: main course, soup, casserole, pasta dish, baked dish, etc.
- The recipe should be easy to prepare, under 45 minutes
- Provide a detailed description (2-3 sentences)
- Select appropriate allergens from this list ONLY: lactose, gluten, egg, peanut, soy, fish, milk_protein, histamine, fructose`;

  if (customFocus && customFocus.trim()) {
    prompt += `

**IMPORTANT - User's special request:**
${customFocus.trim()}
Please consider this request when generating the recipe. The recipe's theme and focus should align with the user's request.`;
  }

  prompt += `

**Respond in EXACTLY this JSON format:**
{
  "title": "Recipe Name in ${targetLanguage}",
  "description": "A detailed 2-3 sentence description of the dish in ${targetLanguage}",
  "category": "Lunch",
  "ingredients": [
    {"name": "Ingredient name in ${targetLanguage}", "quantity": 100, "unit": "gram"}
  ],
  "allergens": ["gluten", "egg"]
}

**Valid categories:** Breakfast, Lunch, Dinner, Snack, Dessert
**Valid units:** teaspoon, tablespoon, cup, pint, milliliter, liter, gram, kilogram, pinch, by_count
**Valid allergens:** lactose, gluten, egg, peanut, soy, fish, milk_protein, histamine, fructose`;

  if (sensitivities.length > 0) {
    const avoidList = sensitivities
      .map((s) => sensitivityMap[s] || s)
      .join(", ");

    prompt += `

**CRITICAL - Food Sensitivities to AVOID:**
The user has the following food sensitivities. DO NOT use these ingredients: ${avoidList}.
Also, do NOT include these in the allergens array since we're avoiding them.`;
  }

  return prompt;
}
