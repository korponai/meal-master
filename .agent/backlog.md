# Backlog – Smart Nutrition

This document describes the completed development iterations of the **Smart Nutrition** application.  
It is intended to be used as **context for AI-assisted development (context engineering)** and reflects the current state of the system.

---

## Completed Iterations

### Iteration 0 – Project Setup

**Status:** Done  
**Goal:** Initialize a Nuxt 4 application with core tooling.

**Deliverables:**

- Nuxt 4 project initialized
- Tailwind CSS configured
- Pinia store setup
- Empty homepage layout
- Top navigation with "Home" menu item

---

### Iteration 1 – Supabase & Authentication

**Status:** Done  
**Goal:** Integrate Supabase and implement email/password authentication.

**Deliverables:**

- Supabase client configuration
- Login page (`/login`)
- User registration and login
- Forgot password page (`/forgot-password`)
- Session handling
- Route protection middleware
- Logout functionality

### Iteration 2 – User Profile

**Status:** Done
**Goal:** Implement user profile management (avatar, name, password).

**Deliverables:**

- `profiles` table in Supabase
- Storage bucket for avatars
- Profile page (`/profile`) with protected access
- Avatar upload component
- Account details editing
- Password change functionality
- Menu item update

### Iteration 3 – Food Sensitivities

**Status:** Done
**Goal:** Implement food sensitivities management in the user profile.

**Deliverables:**

- `food_sensitivities` column in `profiles` table
- Predefined sensitivity types (lactose, gluten, egg, peanut, soy, fish, milk protein, histamine, fructose)
- Toggle-based UI in Profile page
- Immediate saving of sensitivity status

### Iteration 4 – Recipe Allergens

**Status:** Done
**Goal:** Implement allergens management in recipe forms and conflict detection.

**Deliverables:**

- `allergens` column in `recipes` table
- Allergens toggle selector in `RecipeForm.vue`
- Visual warning (red toggle) if recipe allergen conflicts with user sensitivity
- Localization support

### Iteration 5 – Meal Planner / Weekly Calendar

**Status:** Done
**Goal:** Implement weekly meal planning functionality.

**Deliverables:**

- `meal_plans` table in Supabase
- Weekly meal plan page (`/meals/weekly-meal-plan`)
- Weekly calendar view with day columns
- Meal types: Breakfast, Morning snack, Lunch, Afternoon snack, Dinner, Evening snack
- Meal management: Add (from recipes), Edit, Delete
- Week navigation (previous/next/current)
- TypeScript types (`types/meal-plan.ts`)
- Menu item update

### Iteration 6 – AI Recipe Generation

**Status:** Done
**Goal:** Implement AI-powered recipe generation using OpenAI.

**Deliverables:**

- Server API endpoint `/api/ai/generate-recipe` (GPT-4o-mini)
- Server API endpoint `/api/ai/generate-recipe-image` (DALL-E 3)
- AI Recipe Generator component (`components/recipes/AIRecipeGenerator.vue`)
- AI Generate page (`/recipes/ai-generate`)
- "AI Generate" button on recipes index page
- Sensitivity-aware recipe generation (excludes user's food sensitivities)
- Auto-creation of ingredients in database
- Image download from DALL-E and upload to Supabase storage
- Environment variables: `CHATGPT_API_KEY`, `CHATGPT_RECIPE_MODEL`, `CHATGPT_IMAGE_MODEL`
- Localization support (EN, HU, SR)
