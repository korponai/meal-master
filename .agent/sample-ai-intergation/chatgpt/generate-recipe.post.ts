import { z } from 'zod'

const requestSchema = z.object({
  sensitivities: z.array(z.string()).optional().default([]),
  customFocus: z.string().optional(),
})

interface GeneratedRecipe {
  title: string
  ingredients: { name: string; quantity: number; unit: string }[]
  servingSize: number
  nutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  steps: string[]
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (!config.openaiApiKey) {
    throw createError({
      statusCode: 500,
      message: 'OpenAI API key is not configured',
    })
  }

  const body = await readBody(event)
  const { sensitivities, customFocus } = requestSchema.parse(body)

  const prompt = generatePrompt(sensitivities, customFocus)

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'Te egy magyar szakács asszisztens vagy. Egészséges recepteket generálsz részletes tápértékadatokkal. Mindig pontosan a megadott JSON formátumban válaszolj.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API Error:', error)
      throw createError({
        statusCode: response.status,
        message: error.error?.message || 'OpenAI API error',
      })
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw createError({
        statusCode: 500,
        message: 'No response from OpenAI',
      })
    }

    const recipe: GeneratedRecipe = JSON.parse(content)

    return { recipe }
  } catch (error: any) {
    console.error('Error generating recipe:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'Failed to generate recipe',
    })
  }
})

function generatePrompt(sensitivities: string[], customFocus?: string): string {
  let prompt = `Generálj 1 egészséges receptet magyar nyelven.

**Fontos szabályok:**
- MINDEN tápértékadatot KÖTELEZŐEN adj meg (kalória, fehérje, szénhidrát, zsír)!
- NE generálj egyszerű salátát, csak ha kifejezetten azt kérték!
- Válassz változatos ételkategóriát: főétel, leves, egytálétel, sült hús, rakott/töltött étel, tésztaétel, sütőben készült étel.
- A recept legyen könnyen elkészíthető, max 45 perc alatt.`

  // Add custom focus if provided
  if (customFocus && customFocus.trim()) {
    prompt += `

**KIEMELTEN FONTOS - A felhasználó kérése:**
${customFocus.trim()}
Ezt a kérést feltétlenül vedd figyelembe a recept generálásakor! A recept fő témája és fókusza legyen összhangban a felhasználó kérésével.`
  }

  prompt += `

**Válaszolj PONTOSAN ebben a JSON formátumban:**
{
  "title": "Recept neve",
  "ingredients": [
    {"name": "Hozzávaló neve", "quantity": 100, "unit": "g"}
  ],
  "servingSize": 350,
  "nutrition": {
    "calories": 450,
    "protein": 25,
    "carbs": 40,
    "fat": 15
  },
  "steps": [
    "Első lépés leírása",
    "Második lépés leírása"
  ]
}`

  if (sensitivities.length > 0) {
    const sensitivityMap: Record<string, string> = {
      lactose: 'laktóz (tejtermékek)',
      gluten: 'glutén (búza, árpa, rozs)',
      egg: 'tojás',
      nuts: 'mogyoró és diófélék',
      soy: 'szója',
      fish: 'hal és tengeri herkentyűk',
      milk_protein: 'tejfehérje (minden tejtermék)',
      histamine: 'magas hisztamintartalmú élelmiszerek (érlelt sajtok, fermentált ételek)',
      fructose: 'magas fruktóztartalmú élelmiszerek',
    }

    const avoidList = sensitivities
      .map((s) => sensitivityMap[s] || s)
      .join(', ')

    prompt += `\n\n**FONTOS - Érzékenységek figyelembevétele:**\nA következő összetevőket NE használd: ${avoidList}.`
  }

  return prompt
}
