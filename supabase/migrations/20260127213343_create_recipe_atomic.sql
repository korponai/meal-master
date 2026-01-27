-- Create atomic recipe creation function
-- This function handles recipe + categories + ingredients in a single transaction
-- Ensures data integrity and eliminates race conditions

CREATE OR REPLACE FUNCTION create_recipe_atomic(
  recipe_data jsonb,
  categories_data jsonb,
  ingredients_data jsonb
) RETURNS jsonb AS $$
DECLARE
  new_recipe_id uuid;
  recipe_result jsonb;
BEGIN
  -- 1. Insert the recipe and get the ID
  INSERT INTO recipes (
    title,
    description,
    visibility,
    experience,
    allergens,
    nutrients,
    image_url,
    user_id
  )
  VALUES (
    (recipe_data->>'title')::text,
    (recipe_data->>'description')::text,
    (recipe_data->>'visibility')::text,
    (recipe_data->>'experience')::text,
    (recipe_data->'allergens')::jsonb,
    (recipe_data->'nutrients')::jsonb,
    (recipe_data->>'image_url')::text,
    auth.uid() -- Automatically use authenticated user
  )
  RETURNING id INTO new_recipe_id;

  -- 2. Insert categories if provided
  IF categories_data IS NOT NULL AND jsonb_array_length(categories_data) > 0 THEN
    INSERT INTO recipe_categories (recipe_id, category)
    SELECT 
      new_recipe_id,
      (value->>'category')::text
    FROM jsonb_array_elements(categories_data);
  END IF;

  -- 3. Insert ingredients if provided
  IF ingredients_data IS NOT NULL AND jsonb_array_length(ingredients_data) > 0 THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    SELECT 
      new_recipe_id,
      (value->>'ingredient_id')::uuid,
      (value->>'quantity')::numeric,
      (value->>'unit')::text
    FROM jsonb_array_elements(ingredients_data);
  END IF;

  -- 4. Return the created recipe ID
  RETURN jsonb_build_object(
    'recipe_id', new_recipe_id,
    'success', true
  );

EXCEPTION
  WHEN OTHERS THEN
    -- If anything fails, the transaction rolls back automatically
    RAISE EXCEPTION 'Failed to create recipe: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_recipe_atomic TO authenticated;
