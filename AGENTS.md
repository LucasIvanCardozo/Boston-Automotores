# AGENTS.md - Boston Automotores

Guidelines for AI agents working on this Next.js 16 car dealership codebase.

## Project Overview

- **Framework:** Next.js 16.2.1 + React 19.2.4 + TypeScript 5.6
- **Database:** PostgreSQL + Prisma 7.0
- **Styling:** CSS Modules + Tailwind merge
- **Auth:** JWT with httpOnly cookies
- **File Uploads:** Cloudinary

## Build/Lint/Test Commands

```bash
# Development
npm run dev              # Start dev server on port 3000

# Build
npm run build            # Production build
npm run start            # Start production server

# Linting
npm run lint             # Run ESLint (Next.js core-web-vitals config)

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Create and apply migration
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Run seed script
```

**Note:** No test framework is configured yet. To add testing, use `jest` or `vitest`.

## Code Style Guidelines

### TypeScript & Types

- **Strict mode enabled** - no `any` types (ESLint warns on `@typescript-eslint/no-explicit-any`)
- Use explicit return types for server actions and API functions
- Prefer `type` over `interface` for object shapes
- Use Zod for runtime validation (schemas in `/lib/schemas/`)
- Decimal fields from Prisma must be converted to `Number` before passing to Client Components

### Naming Conventions

```typescript
// Files: PascalCase for components, camelCase for utilities
Component.tsx           // React components
Component.module.css    // CSS modules
useHook.ts             // Custom hooks
camelCase.ts           // Utilities, actions, schemas

// Variables
const CAR_STATUS = [...]     // Constants: UPPER_SNAKE_CASE
const localVariable          // Variables: camelCase
const ComponentName          // Components: PascalCase
function handleSubmit()      // Functions: camelCase (handlers start with 'handle')
function getFeaturedCars()   // Data fetchers: start with 'get'
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
import { Component } from '@/components/ui/Button/Button';
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

export default function ClientComponent() {
  const [state, setState] = useState();
  return <div />;
}
```

### Server Actions

```typescript
'use server';

export interface ActionResult {
  success: boolean;
  error?: string;
  data?: SomeType;
}

export async function actionName(formData: FormData): Promise<ActionResult> {
  try {
    // Validate with Zod
    const validation = schema.safeParse(Object.fromEntries(formData));
    if (!validation.success) {
      return { success: false, error: 'Validation failed' };
    }
    
    // Server logic here
    return { success: true, data: result };
  } catch (error) {
    console.error('[actionName] Error:', error);
    return { success: false, error: 'Operation failed' };
  }
}
```

### Error Handling

- Always wrap server actions in try/catch
- Log errors with `[FunctionName]` prefix for debugging
- Return `{ success: false, error: string }` for failures
- Never throw raw errors to client; always serialize them
- Prisma Decimal fields: convert to Number before client serialization

### CSS Modules

```css
/* Component.module.css - Use BEM-like naming */
.button { }
.button--primary { }
.button--loading { }
```

### Project Structure

```
app/
  (public)/           # Public pages with Header/Footer
    page.tsx          # Home
    catalogo/         # Car catalog
    vende-tu-auto/    # Sell car form
    nosotros/         # About us
  (admin)/            # Admin panel (no Header/Footer)
    admin/            # Dashboard, cars, leads
  (auth)/             # Login (no layout)
  actions/            # Server actions
  api/                # API routes

components/
  ui/                 # Reusable UI (Button, Input, Badge)
  forms/              # Form components
  admin/              # Admin-specific components
  sections/           # Page sections (Hero, FeaturedCars)
  layout/             # Header, Footer, Navigation

lib/
  schemas/            # Zod validation schemas
  hooks/              # Custom React hooks
  prisma.ts           # Prisma client singleton
  auth.ts             # Auth utilities
  utils.ts            # Helper functions

prisma/
  schema.prisma       # Database schema
```

### Key Conventions

1. **Route Groups:** Use `(public)`, `(admin)`, `(auth)` for layout separation
2. **Server Actions:** Always define result interfaces; don't return Prisma objects with Decimals
3. **Forms:** Use React Hook Form + Zod resolver; validation mode: `onBlur`
4. **Images:** Use next/image with proper dimensions; Cloudinary URLs stored in DB
5. **Auth:** JWT in httpOnly cookies; use `requireAuth()` in server actions
6. **Decimal handling:** Convert Prisma Decimal to Number before client components

### ESLint Rules

- `@typescript-eslint/no-explicit-any`: warn
- `@typescript-eslint/no-unused-vars`: warn (allows `_` prefix)
- Extends: `next/core-web-vitals`

### Environment Variables

Required in `.env.local`:
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RESEND_API_KEY=...
```
