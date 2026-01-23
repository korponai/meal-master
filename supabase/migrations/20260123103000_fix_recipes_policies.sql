-- Drop existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Users can delete their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can insert their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can update their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can view their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Recipes are viewable by everyone" ON public.recipes;
DROP POLICY IF EXISTS "Public recipes are viewable by everyone" ON public.recipes;

-- Ensure RLS is enabled
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- 1. INSERT: Authenticated users can insert their own recipes
CREATE POLICY "Users can insert their own recipes"
ON public.recipes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 2. SELECT: Users can view their own recipes OR public recipes
CREATE POLICY "Users can view own or public recipes"
ON public.recipes
FOR SELECT
USING (
  (auth.uid() = user_id) OR (visibility = 'public')
);

-- 3. UPDATE: Users can update their own recipes
CREATE POLICY "Users can update their own recipes"
ON public.recipes
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. DELETE: Users can delete their own recipes
CREATE POLICY "Users can delete their own recipes"
ON public.recipes
FOR DELETE
USING (auth.uid() = user_id);
