-- Relax INSERT policy for debugging
DROP POLICY IF EXISTS "Users can insert their own recipes" ON public.recipes;

CREATE POLICY "Users can insert their own recipes"
ON public.recipes
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
