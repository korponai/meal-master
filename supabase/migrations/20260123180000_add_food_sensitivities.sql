alter table profiles 
add column if not exists food_sensitivities text[] default '{}'::text[];
