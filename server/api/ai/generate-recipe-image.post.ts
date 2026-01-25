import { z } from "zod";

const requestSchema = z.object({
  recipeTitle: z.string().min(1),
});

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  if (!config.chatgptApiKey) {
    throw createError({
      statusCode: 500,
      message: "OpenAI API key is not configured",
    });
  }

  const body = await readBody(event);
  const { recipeTitle } = requestSchema.parse(body);

  const prompt = `A high-quality professional food photograph of "${recipeTitle}" served on a white plate. The food should appear freshly prepared, with realistic textures and natural lighting. The background should be softly blurred to focus on the dish. Style: modern food photography, appetizing, warm colors.`;

  try {
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.chatgptApiKey}`,
        },
        body: JSON.stringify({
          model: config.chatgptImageModel,
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          response_format: "url",
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("DALL-E API Error:", data);
      throw createError({
        statusCode: response.status,
        message: data.error?.message || "DALL-E API error",
      });
    }

    if (!data.data?.[0]?.url) {
      throw createError({
        statusCode: 500,
        message: "No image URL received from DALL-E",
      });
    }

    return { url: data.data[0].url };
  } catch (error: any) {
    console.error("Error generating image:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: "Failed to generate image",
    });
  }
});
