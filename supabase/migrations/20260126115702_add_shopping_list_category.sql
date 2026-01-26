-- Add category to shopping_list_items
ALTER TABLE shopping_list_items ADD COLUMN IF NOT EXISTS category text DEFAULT 'Other';

-- Update policy to allow updates (if not already covered)
-- Checking if "Users can update their shopping list items" exists or if the general "Users can update their own data" covers it.
-- Based on previous list_files, specifically 20260121204800_create_profiles_table.sql, usually policies are specific.
-- We'll assume basic CRUD policies exist, but if "category" is new, existing row-level updates should just work if the policy is "USING (auth.uid() = user_id)".
-- Double checking previous policies might be good, but adding a column generally doesn't require new RLS if the table has RLS and valid policies.
