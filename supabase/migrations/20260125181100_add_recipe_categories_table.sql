-- Create recipe_categories junction table for multi-select categories
CREATE TABLE IF NOT EXISTS public.recipe_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    category text NOT NULL CHECK (category IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (recipe_id, category)
);

-- Enable RLS on recipe_categories
ALTER TABLE public.recipe_categories ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view recipe categories
CREATE POLICY "Recipe categories are viewable by everyone" 
ON public.recipe_categories FOR SELECT 
USING (true);

-- Policy: Recipe owners can insert categories
CREATE POLICY "Users can insert categories for their recipes" 
ON public.recipe_categories FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipes.id = recipe_categories.recipe_id
    AND recipes.user_id = auth.uid()
  )
);

-- Policy: Recipe owners can update categories
CREATE POLICY "Users can update categories for their recipes" 
ON public.recipe_categories FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipes.id = recipe_categories.recipe_id
    AND recipes.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipes.id = recipe_categories.recipe_id
    AND recipes.user_id = auth.uid()
  )
);

-- Policy: Recipe owners can delete categories
CREATE POLICY "Users can delete categories for their recipes" 
ON public.recipe_categories FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipes.id = recipe_categories.recipe_id
    AND recipes.user_id = auth.uid()
  )
);

-- Migrate existing category data to new table
INSERT INTO public.recipe_categories (recipe_id, category)
SELECT id, category FROM public.recipes 
WHERE category IS NOT NULL AND category != '';

-- Drop old category column from recipes table
ALTER TABLE public.recipes DROP COLUMN IF EXISTS category;
