---
trigger: always_on
---

# Agent Instructions – Smart Nutrition

## Mission

Implement the features iteration by iteration based on the backlog (project/.agent/backlog.md), using the Nuxt 4 + Supabase stack.

---

## Output rules

At the end of each iteration, describe:

- hich files you created / modified
- how the changes can be manually verified (route, behavior)

Do not ask follow-up questions unless something is blocking.

If you are unsure, use a simple placeholder solution.

---

## Implementation checklist

￼ [ ] TypeScript types defined
￼ [ ] Supabase tables / RLS created (if a new table is needed)
￼ [ ] Components placed in the correct folder
￼ [ ] Pinia store updated (if necessary)
￼ [ ] Zod validation for form inputs
￼ [ ] Loading and error states handled
￼ [ ] Responsive design (mobile + desktop)

---

## Nuxt-specific rules

- Use useSupabaseClient() for database operations
- Use useSupabaseUser() to fetch the logged-in user
- Use navigateTo() for programmatic navigation
- Use definePageMeta({ middleware: 'auth' }) for protected pages

Client-only code: onMounted() or <ClientOnly> wrapper

---

## Supabase-specific rules

When creating or modifying a table:

supabase migration new <name> – create a migration

Write the SQL into the supabase/migrations/ file

supabase db push – run the migration on the remote DB

Update TypeScript types: app/types/supabase.ts

DO NOT write SQL into supabase-setup.md for manual execution!

Storage upload: supabase.storage.from('bucket').upload()

Public URL: supabase.storage.from('bucket').getPublicUrl()

## "Later" guardrails

- Do not implement offline mode
- Do not implement sharing functionality
- Do not implement AI features
- Do not implement any other module beyond what the backlog requests
