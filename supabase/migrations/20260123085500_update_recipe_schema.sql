-- Create ingredients table
CREATE TABLE IF NOT EXISTS public.ingredients (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on ingredients
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

-- Policy for ingredients: Everyone can view, authenticated users can insert
CREATE POLICY "Ingredients are viewable by everyone" ON public.ingredients FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert ingredients" ON public.ingredients FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create recipe_ingredients table
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    ingredient_id uuid NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
    quantity numeric NOT NULL,
    unit text NOT NULL CHECK (unit IN ('teaspoon', 'tablespoon', 'cup', 'pint', 'milliliter', 'liter', 'gram', 'kilogram', 'pinch')),
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on recipe_ingredients
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- Policies for recipe_ingredients
CREATE POLICY "Recipe ingredients are viewable by everyone" ON public.recipe_ingredients FOR SELECT USING (true);

-- Policy to allow recipe owners to insert recipe_ingredients
CREATE POLICY "Users can insert ingredients for their recipes" ON public.recipe_ingredients
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipes.id = recipe_ingredients.recipe_id
    AND recipes.user_id = auth.uid()
  )
);

-- Policy to allow recipe owners to update recipe_ingredients
CREATE POLICY "Users can update ingredients for their recipes" ON public.recipe_ingredients
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipes.id = recipe_ingredients.recipe_id
    AND recipes.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipes.id = recipe_ingredients.recipe_id
    AND recipes.user_id = auth.uid()
  )
);

-- Policy to allow recipe owners to delete recipe_ingredients
CREATE POLICY "Users can delete ingredients for their recipes" ON public.recipe_ingredients
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipes.id = recipe_ingredients.recipe_id
    AND recipes.user_id = auth.uid()
  )
);

-- Modify recipes table
-- Drop the JSONB ingredients column
ALTER TABLE public.recipes DROP COLUMN IF EXISTS ingredients;

-- Add visibility and experience columns
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private'));
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS experience text;
