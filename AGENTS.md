# AGENTS.md - Boston Automotores

Guidelines for AI agents working on this Next.js 16 car dealership codebase.

## Project Overview

- **Framework:** Next.js 16.2.1 + React 19.2.4 + TypeScript 5.6
- **Database:** PostgreSQL + Prisma 7.0 (generated client in `/generated/prisma`)
- **Styling:** CSS Modules + Tailwind merge
- **Auth:** JWT with httpOnly cookies (8h expiry)
- **File Uploads:** Cloudinary
- **Forms:** React Hook Form + Zod validation (mode: `onBlur`)

## Build/Lint/Test Commands

```bash
# Development
npm run dev              # Start dev server on :3000
npm run build            # Production build
npm run start            # Start production server

# Linting
npm run lint             # ESLint (next/core-web-vitals)

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Create and apply migration
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Run seed script (tsx prisma/seed.ts)

# Testing (not configured - add vitest or jest)
# Once configured, run single test:
# npm test -- --testNamePattern="test name"
# npm test -- path/to/test.file.ts
```

## Code Style Guidelines

### TypeScript & Types

- **Strict mode enabled** - no `any` (ESLint warns)
- Use explicit return types for server actions/API functions
- Prefer `type` over `interface` for object shapes
- Use Zod for runtime validation (schemas in `/lib/schemas/`)
- **CRITICAL:** Convert Prisma Decimal fields to `Number` before client serialization

### Naming Conventions

```typescript
// Files: PascalCase for components, camelCase for utilities
Button.tsx, Button.module.css, useHook.ts, car-actions.ts

// Variables
const CAR_STATUS = [...]     // Constants: UPPER_SNAKE_CASE
const localVariable          // Variables: camelCase
const ComponentName          // Components: PascalCase
function handleSubmit()      // Handlers: 'handle' prefix
function getFeaturedCars()   // Fetchers: 'get' prefix
```

### Imports

```typescript
// Order: React/Next → External libs → Internal (@/*) → Local (./)
import { Suspense } from 'react';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button/Button';
import styles from './Component.module.css';

// Path alias: @/* maps to root
```

### React Components

```typescript
// Server Components (default)
export default async function Page() {
  const data = await getData();
  return <Component data={data} />;
}

// Client Components (explicit directive)
'use client';
import { useState } from 'react';
export default function ClientComponent() { ... }
```

### Server Actions Pattern

```typescript
'use server';
import { requireAuth } from '@/lib/auth';

export interface ActionResult {
  success: boolean;
  error?: string;
  data?: SomeType;
}

export async function actionName(formData: FormData): Promise<ActionResult> {
  try {
    await requireAuth();  // Check auth first
    const validation = schema.safeParse(Object.fromEntries(formData));
    if (!validation.success) {
      return { success: false, error: 'Validation failed' };
    }
    // Business logic
    return { success: true, data: result };
  } catch (error) {
    console.error('[actionName] Error:', error);
    return { success: false, error: 'Operation failed' };
  }
}
```

### Error Handling

- Always wrap server actions in try/catch
- Log with `[FunctionName]` prefix for debugging
- Return `{ success: false, error: string }` - never throw to client
- Validate auth with `requireAuth()` before protected actions

### CSS Modules

```css
/* BEM-like naming */
.button { }
.button--primary { }
.button--loading { }
```

## Project Structure

```
app/
  (public)/           # Public pages (Header/Footer)
    catalogo/         # Car catalog
    vende-tu-auto/    # Sell car form
  (admin)/            # Admin panel (no layout extras)
  (auth)/             # Login (no layout)
  actions/            # Server actions (cars.ts, leads.ts, etc.)
  api/                # API routes

components/
  ui/                 # Reusable: Button, Input, Badge, Modal
  forms/              # Form components
  admin/              # Admin components
  sections/           # Hero, FeaturedCars, etc.
  layout/             # Header, Footer, Navigation

lib/
  schemas/            # Zod schemas (car.ts, admin.ts, contact.ts)
  hooks/              # Custom React hooks
  prisma.ts           # Prisma client singleton
  auth.ts             # JWT utilities (generateToken, requireAuth)
  utils.ts            # Helpers (cn for tailwind-merge)

prisma/
  schema.prisma       # Database models & enums
```

## Key Conventions

1. **Route Groups:** `(public)`, `(admin)`, `(auth)` for layout separation
2. **Server Actions:** Define result interfaces; serialize Decimals
3. **Forms:** React Hook Form + Zod resolver; validation: `onBlur`
4. **Images:** next/image with Cloudinary URLs from DB
5. **Auth:** JWT in httpOnly cookies; call `requireAuth()` in protected actions
6. **Decimal Handling:** `Number(car.price)` before client components
7. **Utilities:** Use `cn()` from `@/lib/utils` for class merging; `formatPrice()`, `formatDate()`, `slugify()` for formatting

## ESLint Rules

- `@typescript-eslint/no-explicit-any`: warn
- `@typescript-eslint/no-unused-vars`: warn (allows `_` prefix)
- Extends: `next/core-web-vitals`

## Environment Variables (.env.local)

```
DATABASE_URL=postgresql://...
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RESEND_API_KEY=...
```

## Git & Commits

- Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
- Never add "Co-Authored-By" or AI attribution
- Keep commits focused and atomic

## Additional Resources

- **DEPLOY.md:** Comprehensive deployment guide for Vercel
- **opencode.json:** Contains next-devtools MCP configuration
- **Database Schema:** See `prisma/schema.prisma` for models and enums