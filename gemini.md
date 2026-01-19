# Gemini – Nuxt Project Guidelines

This file defines **mandatory rules** for all code generation and modifications in this Nuxt codebase.
If any rule would be violated, stop and fix the solution to fully comply with these guidelines.

---

## 0) Global Principles (always)

- if "create skeleton" is requested, create a new nuxt project with minimal setup: an home page with one text content, router with one route for home. IMPORTANT: keep as simple as possible, do NOT add any extra dependencies, code, or features. Try to solve the request with minimal code as quick as possible.

- **TypeScript everywhere**.
  - Nuxt: `lang="ts"` in Vue SFC where applicable, typed composables, typed stores, typed server routes.
- Prefer **many small, short functions** over a few large ones.
- **NO automated tests**:
  - Do NOT generate unit / integration / e2e tests.
  - Do NOT keep any test-related scaffolding, configs, or dependencies.
  - If a template generates them (e.g. `__tests__`, `*.spec.ts`, Vitest/Jest configs, Playwright, Cypress), **delete them**.
- **Use `.env` files** for all environment variables.
  - Always provide `.env.example` (no secrets, only placeholders).
  - Never commit secrets.
- If any implementation decision or uncertainty arises, **ASK BEFORE coding**.
  - Examples: auth strategy, endpoint contracts, data models, permissions, UI flows, error handling, pagination, realtime needs, SSR vs CSR.

---

## 1) Nuxt 4 Stack Rules (mandatory)

**Required stack:**

- Nuxt 4
- Tailwind CSS (prefer latest stable; avoid custom CSS)
- Pinia store
- Persistence: **localStorage only**
- Validation: **Zod wherever it makes sense** (runtime validation for inputs and env)

**Nuxt conventions:**

- Prefer Nuxt-native primitives:
  - `useFetch`, `useAsyncData` for data loading
  - `useRuntimeConfig` for env access
  - `server/api/*` for backend endpoints if needed
- Keep SSR/CSR behavior explicit:
  - If a feature must be client-only (e.g. localStorage), wrap with `process.client` or `onMounted`.
  - Use `<ClientOnly>` when necessary.

---

## 2) Folder Structure (mandatory)

### UI / Components

- Reusable components go into: `components/`
- Page-level components go into: `components/pages/`
- Feature-based components:
  - `components/<feature-name>/...`
  - Example:
    - `components/auth/LoginForm.vue`
    - `components/profile/ProfileCard.vue`

### Pages / Routes

- Routes are defined via `pages/` (Nuxt file-based routing).
- Keep `pages/` thin:
  - page files should mostly compose page-level components + minimal orchestration.
  - real logic goes into composables / services.

### Composables / Services / Utils

- Composables: `composables/` (business + UI state, fetching orchestration)
- Services: `services/` (API client wrappers, pure data access layer)
- Shared helpers: `utils/` (pure utilities, formatting, mapping, etc.)

### Server (optional, only if requested)

- If implementing API inside Nuxt:
  - `server/api/**` for endpoints
  - `server/utils/**` for shared server helpers
  - Keep handlers small; move business logic to `server/services/**` if needed

---

## 3) Styling Rules (Tailwind)

- Write **as little custom CSS as possible**.
- Prefer Tailwind utilities everywhere.
- Apply a **global Tailwind theme**:
  - adjust `tailwind.config.*` for colors, spacing, fonts, etc.
  - avoid scattered CSS overrides in components.
- If custom CSS is unavoidable:
  - keep it local to the component
  - keep it minimal and justified

---

## 4) State Management (Pinia + localStorage only)

- Use Pinia stores in `stores/`.
- Persist only via **localStorage**:
  - Do NOT add external persistence libs unless explicitly requested.
  - Ensure client-only access to localStorage (no SSR crashes).
- Store design:
  - keep state minimal
  - actions are small and focused
  - any mapping/formatting goes to `utils/`

---

## 5) Validation (Zod)

- Use **Zod** for:
  - validating form inputs before sending requests
  - validating query params where applicable
  - validating API responses if reliability is uncertain
  - validating env/runtime config shape (where helpful)
- Error messages must be **clear and developer-friendly**.

---

## 6) Environment Variables (.env + runtimeConfig)

- Always use `.env` and `.env.example`.
- Use `useRuntimeConfig()` consistently.
- Conventions:
  - Public (client-exposed): `NUXT_PUBLIC_*`
  - Private (server-only): non-public keys in runtimeConfig
- Typical variables:
  - `NUXT_PUBLIC_API_URL`
  - `NUXT_PUBLIC_APP_URL`
  - (optional) `API_BASE_URL` (server-only) if proxying via server routes

---

## 7) README (mandatory)

- Include a `README.md` that lists **features only**, in short bullet points.
- Keep it updated whenever features, routes, or endpoints change.
- Document required env vars briefly (names only, no secrets).

---

## 8) Workflow Rules (mandatory before coding)

For every task:

1. Describe in **3–7 bullet points** what will be created or changed
   - files, routes, components, composables, stores, server endpoints
2. If any decision point exists, **stop and ask for clarification before implementation**.
3. After implementation:
   - Remove all test-related artifacts.
   - Verify folder structure (components/pages split, composables/services/utils separation).
   - Update the README feature list.
   - Verify `.env.example` completeness (placeholders only).

---

## 9) Forbidden / Avoid

- Any testing frameworks/configs/files (Vitest/Jest/Cypress/Playwright).
- Random global CSS without Tailwind-first justification.
- Unstructured logic in pages/components (move to composables/services/utils).
- Secret values in repo files.
