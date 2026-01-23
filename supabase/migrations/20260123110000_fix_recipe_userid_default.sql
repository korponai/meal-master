-- Set default value for user_id to auth.uid()
ALTER TABLE public.recipes ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Drop the relaxed debug policy
DROP POLICY IF EXISTS "Users can insert their own recipes" ON public.recipes;

-- Restore strict INSERT policy
CREATE POLICY "Users can insert their own recipes"
ON public.recipes
FOR INSERT
WITH CHECK (auth.uid() = user_id);
