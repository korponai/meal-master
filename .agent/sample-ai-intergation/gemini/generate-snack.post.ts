import { z } from "zod";

const requestSchema = z.object({
  sensitivities: z.array(z.string()).optional().default([]),
  existingSnacks: z.array(z.string()).optional().default([]),
});

interface GeneratedSnackIngredient {
  name: string;
  amount: string;
  unit: string | null;
}

interface GeneratedSnack {
  name: string;
  description: string;
  ingredients: GeneratedSnackIngredient[];
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
  const { sensitivities, existingSnacks } = requestSchema.parse(body);

  const prompt = generatePrompt(sensitivities, existingSnacks);

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
                text: "You are a nutritionist. You recommend healthy snacks in English. Always respond exactly in the provided JSON format.",
              },
            ],
          },
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.9,
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

    const snack: GeneratedSnack = JSON.parse(content);

    return { snack };
  } catch (error: any) {
    console.error("Error generating snack:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: "Failed to generate snack",
    });
  }
});

function generatePrompt(
  sensitivities: string[],
  existingSnacks: string[],
): string {
  let prompt = `Recommend 1 healthy snack in English.

**Examples of healthy snacks:**
- Seeds and nuts (pistachios, almonds, walnuts, pumpkin seeds, sunflower seeds)
- Dried fruits (dates, prunes, raisins)
- Vegetable sticks (carrots, cucumber, peppers) with hummus
- Greek yogurt with fruits
- Oatmeal balls
- Rice cakes
- Protein bar (homemade)
- Smoothie
- Fruit salad
- Energy balls (date-walnut based)
- Free-from/vegan cakes
- Low-calorie desserts

**Important rules:**
- It should be healthy and nutritious
- It should be easy to prepare or readily available
- State why this snack is healthy
- The description should be short (1-2 sentences)

**Respond EXACTLY in this JSON format:**
{
  "name": "Snack name",
  "description": "Short description of why it is healthy and when to consume it",
  "ingredients": [
    {"name": "ingredient name", "amount": "quantity as a number", "unit": "unit or null"}
  ]
}

**Example ingredients:**
- {"name": "almonds", "amount": "50", "unit": "g"}
- {"name": "dates", "amount": "4", "unit": "pcs"}
- {"name": "cocoa powder", "amount": "1", "unit": "tbsp"}
- If it is ready-to-buy (e.g., rice cake), write: {"name": "rice cake", "amount": "1", "unit": "pack"}`;

  if (existingSnacks.length > 0) {
    prompt += `\n\n**DO NOT recommend anything that is already on the list:**\n${existingSnacks.join(", ")}`;
  }

  if (sensitivities.length > 0) {
    const sensitivityMap: Record<string, string> = {
      lactose: "lactose (dairy products)",
      gluten: "gluten (wheat, barley, rye)",
      egg: "egg",
      nuts: "nuts and seeds",
      soy: "soy",
      fish: "fish and seafood",
      milk_protein: "milk protein (all dairy products)",
      histamine: "high histamine foods",
      fructose: "high fructose foods",
    };

    const avoidList = sensitivities
      .map((s) => sensitivityMap[s] || s)
      .join(", ");

    prompt += `\n\n**IMPORTANT - Sensitivity considerations:**\nIt MUST NOT contain the following ingredients: ${avoidList}.`;
  }

  return prompt;
}
