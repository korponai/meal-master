import { z } from "zod";

const requestSchema = z.object({
  snackName: z.string().min(1),
});

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  if (!config.geminiApiKey) {
    throw createError({
      statusCode: 500,
      message: "Gemini API key is not configured",
    });
  }

  const body = await readBody(event);
  const { snackName } = requestSchema.parse(body);

  const prompt = `A high-quality professional food photograph of "${snackName}" as a healthy snack. The snack should appear fresh and appetizing, displayed on a clean white surface or in a simple bowl. Natural lighting, shallow depth of field, modern minimalist food photography style. No text or watermarks.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-nano-banana:predict?key=${config.geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: prompt,
            },
          ],
          parameters: {
            sampleCount: 1,
          },
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini Nano Banana API Error:", data);
      throw createError({
        statusCode: response.status,
        message: data.error?.message || "Gemini Nano Banana API error",
      });
    }

    const prediction = data.predictions?.[0];

    let imageUrl = "";
    if (prediction?.bytesBase64) {
      imageUrl = `data:image/jpeg;base64,${prediction.bytesBase64}`;
    } else if (
      typeof prediction === "string" &&
      prediction.startsWith("http")
    ) {
      imageUrl = prediction;
    } else {
      throw createError({
        statusCode: 500,
        message: "Unexpected response format from Gemini Nano Banana",
      });
    }

    return { url: imageUrl };
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
