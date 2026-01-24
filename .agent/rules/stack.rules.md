---
trigger: always_on
---

# Stack Rules – Nuxt 4 + Supabase

## Frontend

### Nuxt 4

- Use **TypeScript everywhere** (`lang="ts"` in all Vue SFCs and scripts).
- Use `useFetch`, `useAsyncData` for data fetching; prefer `useAsyncData` when SSR/SSG integration is needed.
- Use `useRuntimeConfig()` for environment variables and secrets in both server and client contexts.
- Follow **file-based routing** under the `app/` directory (`app/pages/` for pages).
- Use auto-imported components and composables; **don't manually import** what Nuxt auto-imports.
- Prefer **server actions** (`defineNuxtServerAction`) over ad-hoc API calls when possible for form submissions in Nuxt 4.

### Vue 3 (Composition API)

- Always use **Composition API** (`<script setup>`).
- Avoid retired Options API patterns.
- Favor **composables** (`useXyz`) for reusable logic.
- Co-locate types, interfaces, and composables in `composables/`.

### Styling

- Use **Tailwind CSS** for utility-first styles; install and configure via Nuxt module.
- Keep global styles in `assets/css/` and minimal component-scoped styles.
- Use CSS variables and tokens for design consistency.

### Internationalization i18n

- Always use i18n internationalisation. The supported languages: English, Hungarian, and Serbian

### Directory Structure

├── app/
│ ├── components/
│ ├── layouts/
│ ├── pages/
│ └── plugins/
├── composables/
├── assets/
├── public/
├── server/
│ └── api/
├── supabase/ (optional – supabase helpers)
├── nuxt.config.ts
├── tsconfig.json
└── package.json

## Backend / API Integration

### Supabase

- Use **Supabase client** for database and auth operations.
- Keep Supabase config in **runtime config** (`useRuntimeConfig()`).
- Prefer **Server API routes** (`server/api/*.ts`) for secure server-side logic and DB access.
- Never expose Supabase service role keys in the client.

## Data & Fetching

- Always type your API responses and data models in TypeScript.
- Use `useLazyFetch` when you need on-demand data fetching.
- Avoid cluttering templates with business logic; push logic into composables.

## Code Quality

- Enforce **linting (ESLint)** and **formatting (Prettier)** rules.
- Use strict TypeScript (`strict: true` in `tsconfig.json`).
- No `any` types without justification.
- Write unit tests for critical components and composables.

## Git & Workflow

- Branch naming: `feature/`, `fix/`, `chore/`, etc.
- Commit messages follow Conventional Commits.
- Pull Request description must include changelog and testing steps.

## Deployment & Environment

- Store secrets and keys in `.env` and map them via runtime config.
- Keep production config separate from development config.

## Testing

- Include end-to-end tests (e.g., Playwright/Vitest) for core flows.
- Mock Supabase in tests using a test-helper or local emulator.

## Documentation

- Keep documentation up to date under `.agent/`.
- Use consistent markdown styles and code examples.
