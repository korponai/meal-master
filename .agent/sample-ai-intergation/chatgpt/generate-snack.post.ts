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

  if (!config.openaiApiKey) {
    throw createError({
      statusCode: 500,
      message: "OpenAI API key is not configured",
    });
  }

  const body = await readBody(event);
  const { sensitivities, existingSnacks } = requestSchema.parse(body);

  const prompt = generatePrompt(sensitivities, existingSnacks);

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
              "You are a nutrition expert. You recommend healthy snacks. Always respond in exactly the specified JSON format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.9,
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
  let prompt = `Recommend 1 healthy snack.

**Examples of healthy snacks:**
- Seeds and nuts (pistachios, almonds, walnuts, pumpkin seeds, sunflower seeds)
- Dried fruits (dates, dried plums, raisins)
- Vegetable sticks (carrots, cucumber, bell pepper) with hummus
- Greek yogurt with fruits
- Oatmeal balls
- Rice cakes
- Protein bar (homemade)
- Smoothie
- Fruit salad
- Energy balls (date-nut based)
- Allergy-free/vegan pastries
- Low-calorie desserts

**Important rules:**
- Should be healthy and nutritious
- Easy to prepare or readily available
- Explain why this snack is healthy
- Description should be short (1-2 sentences)

**Respond in EXACTLY this JSON format:**
{
  "name": "Snack name",
  "description": "Short description of why it's healthy and when to eat it",
  "ingredients": [
    {"name": "ingredient name", "amount": "quantity as number", "unit": "unit or null"}
  ]
}

**Example ingredients:**
- {"name": "almonds", "amount": "50", "unit": "g"}
- {"name": "dates", "amount": "4", "unit": "pcs"}
- {"name": "cocoa powder", "amount": "1", "unit": "tbsp"}
- If store-bought (e.g., rice cakes), write: {"name": "rice cakes", "amount": "1", "unit": "pack"}`;

  if (existingSnacks.length > 0) {
    prompt += `\n\n**Do NOT recommend something already on this list:**\n${existingSnacks.join(", ")}`;
  }

  if (sensitivities.length > 0) {
    const sensitivityMap: Record<string, string> = {
      lactose: "lactose (dairy products)",
      gluten: "gluten (wheat, barley, rye)",
      egg: "eggs",
      nuts: "peanuts and tree nuts",
      soy: "soy",
      fish: "fish and seafood",
      milk_protein: "milk protein (all dairy products)",
      histamine: "high histamine foods",
      fructose: "high fructose foods",
    };

    const avoidList = sensitivities
      .map((s) => sensitivityMap[s] || s)
      .join(", ");

    prompt += `\n\n**IMPORTANT - Food sensitivities to consider:**\nThe snack must NOT contain: ${avoidList}.`;
  }

  return prompt;
}
