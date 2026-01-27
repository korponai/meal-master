-- Add Dessert category to allowed values in recipe_categories table
-- Drop existing check constraint
ALTER TABLE public.recipe_categories DROP CONSTRAINT IF EXISTS recipe_categories_category_check;

-- Add new check constraint with Dessert included
ALTER TABLE public.recipe_categories 
ADD CONSTRAINT recipe_categories_category_check 
CHECK (category IN ('Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'));
