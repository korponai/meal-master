-- Drop and recreate the unit check constraint to include 'by_count'
ALTER TABLE public.recipe_ingredients DROP CONSTRAINT IF EXISTS recipe_ingredients_unit_check;
ALTER TABLE public.recipe_ingredients ADD CONSTRAINT recipe_ingredients_unit_check 
  CHECK (unit IN ('teaspoon', 'tablespoon', 'cup', 'pint', 'milliliter', 'liter', 'gram', 'kilogram', 'pinch', 'by_count'));
