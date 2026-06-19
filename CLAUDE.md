# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 8081
npm run build        # Production build
npm run build:dev    # Dev build with source maps
npm run lint         # ESLint check
npm run preview      # Preview production build locally
```

There are no tests in this project.

## Architecture Overview

**Stack:** React 18 + TypeScript + Vite (SWC), React Router v6, Tailwind CSS + shadcn/ui (Radix UI), Firebase, Supabase, TanStack React Query, Razorpay.

**Path alias:** `@` maps to `./src` — use `@/components/...` style imports throughout.

### Provider Hierarchy (App.tsx)

The provider nesting order matters — inner providers can consume outer ones:

```
QueryClientProvider
  → AuthProvider (Firebase user auth)
    → AdminAuthProvider (Firebase admin auth)
      → CartProvider
        → WishlistProvider
          → BrowserRouter
```

### Routing

- **Public:** `/`, `/products`, `/product/:id`, `/about`, `/gallery`, `/search`
- **User auth:** `/login`, `/login/email-link`, `/login/finish`, `/forgot-password`
- **User pages:** `/cart`, `/wishlist`, `/my-orders`, `/profile`, `/order/:id`, `/track-order`, `/order-confirmation/:orderId`
- **Admin:** `/admin` (login), `/inventory/*` (protected dashboard with sidebar)

Admin routes check the `VITE_ADMIN_EMAILS` env var to authorize access.

### Dual Backend: Supabase vs Firebase

There are **two parallel API layers** in `src/lib/`:

| File | Backend | Usage |
|------|---------|-------|
| `adminApi.ts` | Supabase (PostgreSQL) | Primary admin API |
| `adminApiFirebase.ts` | Firestore | Alternative/duplicate admin API |
| `supabaseClient.ts` | Supabase | Client initialization |
| `firebase.ts` | Firebase | Client initialization |

`adminApi.ts` maps camelCase UI fields to snake_case DB columns. When adding new product/order fields, update both the API and the Supabase table schema.

### State Management

- **Cart** (`CartContext.tsx`): useReducer for complex transitions; persists via Supabase/localStorage
- **Wishlist** (`WishlistContext.tsx`): useState; operations via `wishlistApi.ts`
- **User auth** (`AuthContext.tsx`): Firebase — email magic link, email OTP, phone OTP with reCAPTCHA
- **Admin auth** (`AdminAuthContext.tsx`): Firebase email/password + `VITE_ADMIN_EMAILS` whitelist check
- **Inventory** (`InventoryContext.tsx`): Admin product/order data; wraps `adminApi.ts`

### Admin Panel (`src/Inventory/`)

Self-contained feature with its own pages (Dashboard, Products, Orders, Categories) and components. Accessed at `/inventory/*` and protected by `ProtectedRoute`. Has a separate sidebar nav layout from the customer-facing app.

### Authentication Flow

Users authenticate via Firebase with three methods (email link, email OTP, phone OTP). The email-link flow stores the email in `localStorage` and completes on the `/login/finish` route. reCAPTCHA is initialized on phone auth flows.

## Environment Variables

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_FIREBASE_*          # Standard Firebase config keys
VITE_ADMIN_EMAILS        # Comma-separated admin email whitelist
VITE_RAZORPAY_KEY_ID
```

## Deployment

Deployed on Vercel. `vercel.json` rewrites all routes to `index.html` for SPA routing. Firebase security rules are in `firestore.rules`.
