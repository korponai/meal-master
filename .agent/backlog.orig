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
- Session handling
- Route protection middleware
- Logout functionality

---

### Iteration 2 – Recipes CRUD

**Status:** Done  
**Goal:** Implement full CRUD functionality for recipes.

**Deliverables:**

- `recipes` table in Supabase
- Recipe list page (`/recipes`)
- Create recipe page (`/recipes/new`)
- Recipe details page (`/recipes/:id`)
- Edit recipe page (`/recipes/:id/edit`)
- Row Level Security (RLS) policies
- Pinia recipes store

---

### Iteration 3 – User Profile

**Status:** Done  
**Goal:** Implement user profile page.

**Deliverables:**

- Profile page (`/profile`)
- Account information section (email display)
- Settings section (food sensitivities link)
- Food sensitivities placeholder page (`/profile/sensitivities`)
- Navigation update: profile dropdown menu
- Upload profile picture

---

### Iteration 4 – Food Sensitivities

**Status:** Done  
**Goal:** Implement food sensitivities management.

**Deliverables:**

- Fully implemented food sensitivities page (`/profile/sensitivities`)
- 9 predefined sensitivity types (lactose, gluten, egg, peanut, soy, fish, milk protein, histamine, fructose)
- Checkbox-based selection UI
- Persisted storage in Supabase
- Loading and error state handling
- Informational description box
- Pinia food-sensitivities store
- TypeScript types (`food-sensitivity.ts`)

---

### Iteration 5 – PayPal Donation Integration

**Status:** Done  
**Goal:** Enable donation payments using PayPal.

**Deliverables:**

- PayPal setup documentation (`.agent/paypal-setup.md`)
- `donations` table in Supabase (migration)
- Server API routes:
  - `/api/payment/start`
  - `/api/payment/callback`
  - `/api/payment/[id]`
- Server utilities:
  - `server/utils/paypal.ts`
  - `server/utils/supabase.ts`
- Donation UI integration on profile page
- Donation success/error page (`/profile/donation/success` and `/profile/donation/error`)
- PayPal environment variables (sandbox)
- TypeScript donation types

---

### Iteration 6 – Login Page Redesign

**Status:** Done  
**Goal:** Redesign login page based on the new design system.

**Deliverables:**

- Split layout: branding panel + form panel
- Left panel:
  - Emerald gradient background
  - "Smart Nutrition" title and description
  - Three feature bullet points with check icons
- Right panel:
  - White card layout
  - Avatar icon
  - Form fields with icons
- Updated emerald/green color theme
- Divider with "or" and "Back to homepage" link
- Dedicated `auth` layout (no header)
- Fully responsive (form-only on mobile)

---

### Iteration 7 – Weekly Meal Plan

**Status:** Done  
**Goal:** Implement weekly meal planning functionality.

**Deliverables:**

- Weekly meal plan page (`/meals/weekly-meal-plan`)
- 7-day grid layout (Monday–Sunday)
- 8 meal types per day:
  - Breakfast
  - Morning snack
  - Lunch
  - Afternoon snack
  - Dinner
  - Evening snack
- Highlight current day
- Week navigation (previous/next week, date range)
- Meal creation:
  - Recipe selection or custom meal name
- Edit and delete meals
- Recipe search modal
- Pinia meal-plan store
- TypeScript types (`types/meal-plan.ts`)
- Navigation update: "Weekly Meal Plan" under Meals dropdown

---

### Iteration 8 – AI Recipe Generation

**Status:** Done  
**Goal:** AI-powered recipe generation using OpenAI.

**Deliverables:**

- Recipe ideas page (`/meals/recipe-ideas`)
- Server API endpoints:
  - `/api/ai/generate-recipe`
  - `/api/ai/generate-recipe-image`
- Gemini integration:
  - Gemini 3 Pro for recipe generation (title, ingredients, nutrition, steps)
  - Gemini Nano Banana for recipe images
- Food sensitivities applied to generation
- Custom user prompt support (e.g. “high-protein dinner”)
- UI states:
  - Default form
  - Loading skeletons
  - Result view with image, nutrition, ingredients, steps
- Separate loading state for image generation
- Save generated recipe to recipes list
- Regenerate recipe button
- Navigation update: "Recipe Ideas (AI)"
- Environment variable: `GEMINI_API_KEY`

---

### Iteration 9 – AI Snack Recommender

**Status:** Done  
**Goal:** AI-based healthy snack recommendation.

**Deliverables:**

- Snack recommender page (`/meals/snack-recommender`)
- Server API endpoints:
  - `/api/ai/generate-snack`
  - `/api/ai/generate-snack-image`
- Supabase migrations:
  - `snacks`
  - `snack_ingredients`
- RLS policies for both tables
- Updated TypeScript types
- Storage utility:
  - `uploadSnackImageFromBase64()`
- TypeScript types (`types/snack.ts`)
- Snack recommendation UI:
  - Sensitivity-aware checkbox
  - "Recommend a snack" button with loading state
- Generated snack card:
  - Image with loading spinner
  - Name and description
  - Actions: Save / Another / Discard
- Saved snacks section:
  - Grid view
  - Snack cards with "AI recommendation" badge
  - Delete on hover
- Exclude already saved snacks from recommendations
- Navigation update: "Snack Recommender (AI)"
- Loading state persists until both text and image are generated
- Weekly meal plan integration (snacks can be added)

---

### Iteration 10 – AI Shopping List

**Status:** Done  
**Goal:** AI-assisted shopping list generation.

**Deliverables:**

- Shopping list page (`/meals/shoppinglist`)
- Server API endpoint:
  - `/api/ai/categorize-ingredients`
- Pinia shopping-list store
- TypeScript types (`types/shopping-list.ts`)
- Week navigation
- Ingredient aggregation from:
  - Weekly meal plan recipes
  - Weekly meal plan snacks
- Ingredient deduplication and quantity merging
- AI-powered categorization:
  - Category grouping (Dairy, Vegetables, Meat, etc.)
  - Category icons
  - Manual recategorization
- Progress tracking:
  - Checkbox per ingredient
  - Progress counter and progress bar
  - "Select all" and "Reset" actions
- Source recipes displayed per ingredient
- Navigation update: "Shopping List"
- Include snacks in recipe search results.

---

### Iteration 11 – Landing Page

**Status:** Done  
**Goal:** Implement full landing page based on design.

**Deliverables:**

- Redesigned landing page (`/`)
- Dedicated landing layout (`layouts/landing.vue`)
- Hero section:
  - Custom header
  - Background image
  - Title, subtitle, CTA buttons
- Features section with 6 feature cards
- Pricing section:
  - Free plan
  - PRO plan with highlighted badge
- CTA section with gradient background
- Footer with branding and copyright

---

### Bug Fix – Meal Plans Supabase Migration

**Status:** Done  
**Goal:** Store weekly meal plans in Supabase instead of localStorage.

**Deliverables:**

- Supabase migration: `meal_plans` table
- RLS policies
- Updated TypeScript types
- Meal-plan store refactor:
  - `fetchMeals()`
  - `addMeal()`
  - `removeMeal()`
  - `updateMeal()`
- Updated pages to async operations:
  - `heti-etkezes.vue`
  - `bevasarlolista.vue`

---

## Planned / Future Iterations

The following iterations are **not yet implemented**.  
They represent potential next steps and should be treated as **non-existent features** unless explicitly stated otherwise.

### Iteration 12 – Nutrition Goals & Tracking (Planned)

**Status:** Planned  
**Goal:** Allow users to define nutrition goals and track progress.

**Potential Scope:**

- Daily calorie target
- Macro targets (protein, carbs, fat)
- Weekly summary view
- Integration with:
  - Recipes
  - Weekly meal plan
- Visual progress indicators

**Notes for AI:**

- No nutrition goal system currently exists
- No calorie tracking logic is implemented
- Nutrition data is informational only at this stage

---

### Iteration 13 – Recipe Scaling & Portions (Planned)

**Status:** Planned  
**Goal:** Support portion-based ingredient scaling.

**Potential Scope:**

- Adjustable serving size per recipe
- Automatic ingredient quantity recalculation
- Shopping list integration

**Notes for AI:**

- Recipes currently have static ingredient quantities
- No portion metadata is stored in the database

---

### Iteration 14 – Admin & Content Management (Planned)

**Status:** Planned  
**Goal:** Provide basic admin tooling.

**Potential Scope:**

- Admin-only dashboard
- User overview
- Subscription analytics
- Feature flags (e.g. AI usage limits)

**Notes for AI:**

- There is currently NO admin role
- All users are treated equally
- No backoffice UI exists

---

## System Overview & Architecture Summary

This section describes the **current system architecture** and is intended to help AI models reason about the application correctly.

### Frontend

- Framework: **Nuxt 3**
- Language: **TypeScript**
- Styling: **Tailwind CSS**
- State management: **Pinia**
- Layouts:
  - Default app layout
  - Auth layout (no header)
  - Landing layout (marketing pages)

### Backend / Server

- Runtime: **Nuxt Server API (Nitro)**
- API style: REST-like endpoints under `/api/*`
- No separate backend service exists

### Database & Auth

- Platform: **Supabase**
- Authentication:
  - Email + password
  - Supabase Auth sessions
- Database:
  - PostgreSQL (managed by Supabase)
  - Strict Row Level Security (RLS)
- All user data is scoped by `auth.uid()`

### Storage

- Supabase Storage used for:
  - AI-generated snack images
  - Potential future media uploads
- Images are stored as public objects with generated URLs

### Payments

- Provider: **Barion**
- Flow:
  1. Payment start via server API
  2. Barion redirect
  3. Callback handling
  4. Subscription activation
- Subscription validity is time-based and survives cancellation

### AI Integrations

- Provider: **OpenAI**
- Models used:
  - GPT-4o-mini (text generation)
  - DALL·E 3 (image generation)
- AI is used for:
  - Recipe generation
  - Snack recommendations
  - Ingredient categorization
- AI features are **PRO-only**

---

## AI Context Rules & Assumptions (Critical)

This section defines **strict rules** for AI-assisted development and reasoning.

### Existing Features Only

- AI must assume that **ONLY the features listed as "Done" exist**
- Planned iterations must NOT be referenced as implemented
- No hidden or implied features exist

### Data Persistence Rules

- Supabase is the **single source of truth**
- localStorage is used only where explicitly stated
- All persisted user data is scoped to the authenticated user

### Authorization & Roles

- There is **NO role-based access control**
- There is **NO admin user**
- All authenticated users have the same permissions

### Subscriptions

- Free and PRO plans exist
- PRO unlocks AI features
- A canceled subscription may still be valid until its expiry date
- Subscription status must always be checked server-side when relevant

### AI Usage Constraints

- AI-generated content is:
  - Non-medical
  - Non-diagnostic
  - Informational only
- Food sensitivities are treated as **preferences**, not medical advice
- AI output must respect selected sensitivities but cannot guarantee safety

### Coding & Design Assumptions

- TypeScript is mandatory
- Composition API is used everywhere
- Pinia stores are the preferred shared state solution
- Server logic must live under `/server`
- No external backend services should be assumed

### Naming & Language

- URLs and internal code are mostly Hungarian
- UI text may be Hungarian or English
- Database schemas and TypeScript types are English

---

## End of Context

This backlog represents the **authoritative description** of the Better Life application.  
Any AI-assisted changes, features, or refactors must be consistent with this document.
