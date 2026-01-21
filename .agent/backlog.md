# Backlog – Smart Nutrition

This document describes the completed development iterations of the **Smart Nutrition** application.  
It is intended to be used as **context for AI-assisted development (context engineering)** and reflects the current state of the system.

---

## Completed Iterations

### Iteration 0 – Project Setup

**Status:** Done  
**Goal:** Initialize a Nuxt 4 application with core tooling.

**Deliverables:**

- Nuxt 4 project initialized
- Tailwind CSS configured
- Pinia store setup
- Empty homepage layout
- Top navigation with "Home" menu item

---

### Iteration 1 – Supabase & Authentication

**Status:** Done  
**Goal:** Integrate Supabase and implement email/password authentication.

**Deliverables:**

- Supabase client configuration
- Login page (`/login`)
- User registration and login
- Forgot password page (`/forgot-password`)
- Session handling
- Route protection middleware
- Logout functionality

### Iteration 2 – User Profile

**Status:** Done
**Goal:** Implement user profile management (avatar, name, password).

**Deliverables:**

- `profiles` table in Supabase
- Storage bucket for avatars
- Profile page (`/profile`) with protected access
- Avatar upload component
- Account details editing
- Password change functionality
- Menu item update
