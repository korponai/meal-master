# Smart Nutrition

## Usage

Always implement the current iteration based on the backlog.

## Scope (current)

- Personal nutrition management app (Smart Nutrition)
- Nutrition module: recipes, ingredients, preparation steps, cooking sessions
- Authentication with Supabase Auth
- Data persisted in Supabase
- Images in Supabase Storage

## Tech Stack

- Nuxt 4 + Vue 3 + TypeScript
- Tailwind CSS
- Pinia (state management)
- Zod (validation)
- Supabase (database, auth, storage)

## Features

- Home page with welcome text
- Minimal Nuxt 4 setup
- Tailwind CSS styling
- Pinia state management (ready)
- Zod validation (ready)
- Donation feature (PayPal integration)
- AI-powered recipe generation (OpenAI GPT-4o-mini + DALL-E 3)

## Environment Variables

- `NUXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NUXT_PUBLIC_SUPABASE_KEY` - Supabase anon key
- `NUXT_PUBLIC_PAYPAL_CLIENT_ID` - PayPal client ID for donation feature
- `CHATGPT_API_KEY` - OpenAI API key for AI recipe generation
- `CHATGPT_RECIPE_MODEL` - Model for recipe generation (default: gpt-4o-mini)
- `CHATGPT_IMAGE_MODEL` - Model for image generation (default: dall-e-3)
