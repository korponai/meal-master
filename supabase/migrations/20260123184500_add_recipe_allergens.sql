alter table recipes 
add column if not exists allergens text[] default '{}'::text[];
