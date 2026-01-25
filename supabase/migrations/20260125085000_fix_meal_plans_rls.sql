ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Users can manage their own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can select their own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can insert their own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can update their own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can delete their own meal plans" ON meal_plans;

-- Create granular policies
CREATE POLICY "Users can select their own meal plans"
ON meal_plans FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal plans"
ON meal_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plans"
ON meal_plans FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal plans"
ON meal_plans FOR DELETE
USING (auth.uid() = user_id);
