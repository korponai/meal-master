import { z } from 'zod'

const requestSchema = z.object({
  snackName: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (!config.openaiApiKey) {
    throw createError({
      statusCode: 500,
      message: 'OpenAI API key is not configured',
    })
  }

  const body = await readBody(event)
  const { snackName } = requestSchema.parse(body)

  const prompt = `A high-quality professional food photograph of "${snackName}" as a healthy snack. The snack should appear fresh and appetizing, displayed on a clean white surface or in a simple bowl. Natural lighting, shallow depth of field, modern minimalist food photography style. No text or watermarks.`

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'url',
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('DALL-E API Error:', data)
      throw createError({
        statusCode: response.status,
        message: data.error?.message || 'DALL-E API error',
      })
    }

    if (!data.data?.[0]?.url) {
      throw createError({
        statusCode: 500,
        message: 'No image URL received from DALL-E',
      })
    }

    return { url: data.data[0].url }
  } catch (error: any) {
    console.error('Error generating image:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'Failed to generate image',
    })
  }
})
