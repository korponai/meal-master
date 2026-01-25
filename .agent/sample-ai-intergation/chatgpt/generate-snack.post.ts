import { z } from 'zod'

const requestSchema = z.object({
  sensitivities: z.array(z.string()).optional().default([]),
  existingSnacks: z.array(z.string()).optional().default([]),
})

interface GeneratedSnackIngredient {
  name: string
  amount: string
  unit: string | null
}

interface GeneratedSnack {
  name: string
  description: string
  ingredients: GeneratedSnackIngredient[]
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
  const { sensitivities, existingSnacks } = requestSchema.parse(body)

  const prompt = generatePrompt(sensitivities, existingSnacks)

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
              'Te egy táplálkozási szakértő vagy. Egészséges nassolnivalókat ajánlasz magyar nyelven. Mindig pontosan a megadott JSON formátumban válaszolj.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.9,
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

    const snack: GeneratedSnack = JSON.parse(content)

    return { snack }
  } catch (error: any) {
    console.error('Error generating snack:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'Failed to generate snack',
    })
  }
})

function generatePrompt(sensitivities: string[], existingSnacks: string[]): string {
  let prompt = `Ajánlj 1 egészséges nassolnivalót magyar nyelven.

**Példák egészséges nasikra:**
- Magvak és diófélék (pisztácia, mandula, dió, tökmag, napraforgómag)
- Szárított gyümölcsök (datolya, aszalt szilva, mazsola)
- Zöldség sticksek (répa, uborka, paprika) hummusszal
- Görög joghurt gyümölcsökkel
- Zabpelyhes golyók
- Rizskeksz
- Protein szelet (házi készítésű)
- Smoothie
- Gyümölcssaláta
- Energiagolyók (datolya-dió alapú)
- Mindenmentes/vegán sütemények
- Kalóriaszegény desszertek

**Fontos szabályok:**
- Legyen egészséges és tápláló
- Könnyen elkészíthető vagy készen kapható legyen
- Add meg, miért egészséges ez a nasi
- A leírás legyen rövid (1-2 mondat)

**Válaszolj PONTOSAN ebben a JSON formátumban:**
{
  "name": "Nasi neve",
  "description": "Rövid leírás, miért egészséges és mikor érdemes fogyasztani",
  "ingredients": [
    {"name": "összetevő neve", "amount": "mennyiség számmal", "unit": "mértékegység vagy null"}
  ]
}

**Példa összetevőkre:**
- {"name": "mandula", "amount": "50", "unit": "g"}
- {"name": "datolya", "amount": "4", "unit": "db"}
- {"name": "kakaópor", "amount": "1", "unit": "ek"}
- Ha készen vásárolható (pl. rizskeksz), írd: {"name": "rizskeksz", "amount": "1", "unit": "csomag"}`

  if (existingSnacks.length > 0) {
    prompt += `\n\n**NE ajánlj olyat, ami már szerepel a listában:**\n${existingSnacks.join(', ')}`
  }

  if (sensitivities.length > 0) {
    const sensitivityMap: Record<string, string> = {
      lactose: 'laktóz (tejtermékek)',
      gluten: 'glutén (búza, árpa, rozs)',
      egg: 'tojás',
      nuts: 'mogyoró és diófélék',
      soy: 'szója',
      fish: 'hal és tengeri herkentyűk',
      milk_protein: 'tejfehérje (minden tejtermék)',
      histamine: 'magas hisztamintartalmú élelmiszerek',
      fructose: 'magas fruktóztartalmú élelmiszerek',
    }

    const avoidList = sensitivities
      .map((s) => sensitivityMap[s] || s)
      .join(', ')

    prompt += `\n\n**FONTOS - Érzékenységek figyelembevétele:**\nA következő összetevőket NE tartalmazzon: ${avoidList}.`
  }

  return prompt
}
