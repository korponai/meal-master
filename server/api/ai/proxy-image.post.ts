import { z } from "zod";

const requestSchema = z.object({
  imageUrl: z.string().url(),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { imageUrl } = requestSchema.parse(body);

  try {
    // Fetch the image from the external URL (server-side, no CORS issues)
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        message: "Failed to fetch image from URL",
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const contentType = response.headers.get("content-type") || "image/png";

    return {
      base64,
      contentType,
    };
  } catch (error: any) {
    console.error("Error proxying image:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: "Failed to download image",
    });
  }
});
