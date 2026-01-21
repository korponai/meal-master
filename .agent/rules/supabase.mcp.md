---
trigger: always_on
---

# Supabase MCP + Nuxt 3 Project Guidelines

## Environment Alignment

Mapping Variables: Ensure the MCP environment variables align with Nuxt’s runtimeConfig.

MCP SUPABASE_URL ↔ Nuxt NUXT_PUBLIC_SUPABASE_URL
MCP SUPABASE_SERVICE_ROLE_KEY ↔ Nuxt NUXT_SUPABASE_SERVICE_ROLE_KEY (Server-only)

## Development Standards

### Database & Schema

Type Generation: Use the MCP tool generate_typescript_types to output types into types/database.types.ts.

Nuxt Module: Always assume the project uses @nuxtjs/supabase. When writing code, prefer the composables useSupabaseClient() (client-side) and serverSupabaseClient(event) (server-side).

### Server-Side Logic (server/)

API Endpoints: When generating Nitro server routes (in server/api or server/middleware), use the serverSupabaseClient to ensure the service role or user session is correctly handled.

RLS Awareness: Before writing complex filters, use the MCP tool list_tables to check if Row Level Security (RLS) is enabled. If it is, the AI must ensure the anon key or a valid user session is used in the code it generates.

### Client-Side Logic (composables/, pages/)

Auto-imports: Do not manually import createClient. Use Nuxt’s auto-imported useSupabaseClient.

Security: Never use the service_role_key in the pages/ or components/ directories. Use the MCP to verify which operations require a server-side proxy to stay secure.

## Operational Best Practices

Migrations First: For any schema changes, instruct the AI to use apply_migration via the MCP rather than generating raw SQL for you to copy-paste. This keeps the local ./supabase/migrations folder in sync.

Edge Functions: Since Nuxt and Supabase Edge Functions both use TypeScript, use the MCP tool get_edge_function to copy logic between the Nuxt server and Supabase Edge Functions if high-performance background tasks are needed.

## Example Prompt for your AI Assistant:

"Using the Supabase MCP, inspect my profiles table. Then, create a Nuxt server API route in server/api/profile.get.ts that fetches the current user's profile using the serverSupabaseClient. Ensure it returns a 401 if no session is found."

## Absolute Rules (Non-Negotiable)

1. **ALL database changes MUST be done via Supabase migrations**

   * This includes:

     * Creating or modifying tables
     * Adding or altering columns
     * Creating or changing indexes
     * Enabling RLS
     * Creating, modifying, or deleting RLS policies
     * Any schema or data-structure change

2. **NEVER write executable SQL into `supabase-setup.md`**

   * `supabase-setup.md` is **documentation only**
   * It MUST NOT contain SQL intended for manual execution

3. **NEVER ask the user to run SQL manually**

   * All SQL MUST live in migration files
   * All execution MUST happen via the Supabase MCP

---

## Mandatory Workflow

### Step 1: Ensure Project Is Linked

### Step 2: Create a Migration (Required)

For **every** database change, create a new migration:


This MUST produce a file at:

```
supabase/migrations/<timestamp>_<migration_name>.sql
```

❌ Do NOT reuse existing migration files
❌ Do NOT modify already-applied migrations

---

### Step 3: Write SQL ONLY in the Migration File

All SQL MUST be written inside the generated migration file.

Example responsibilities of a migration:

* Table creation
* Index creation
* RLS enablement
* RLS policy definitions
* Constraints and relationships

Example (excerpt):

```sql
ALTER TABLE example ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own rows"
  ON example FOR SELECT
  USING (auth.uid() = user_id);
```

### Step 4: Immediately Apply the Migration

After creating and editing the migration file, **ALWAYS run**:

supabase db push


❌ Never leave migrations unapplied
❌ Never assume migrations will be applied later


## Naming Rules (Mandatory)

Migration names MUST follow these patterns:

* `create_<table_name>` – create a new table
* `add_<column>_to_<table>` – add a column
* `alter_<table>_<change>` – modify a table
* `drop_<table_name>` – drop a table
* `add_<policy>_policy` – add an RLS policy

❌ Vague names are not allowed
❌ Multiple unrelated changes in one migration are discouraged


## State Validation Rules

### Checking Schema Consistency

### Handling Already-Applied Migrations

## Final Enforcement Rules for AI

1. **Every database change → exactly one migration**
2. **No migration → no change**
3. **No manual SQL execution**
4. **No undocumented side effects**
5. **Always push migrations immediately**
6. **Always verify project linkage before pushing**
7. **Documentation files are NEVER execution targets**

Failure to follow these rules is considered **incorrect behavior**.
