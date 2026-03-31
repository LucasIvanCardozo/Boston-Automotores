# AGENTS.md — Boston Automotores

Guidelines for AI agents working in this Next.js 16 + Prisma 7 codebase.

---

## Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build — run to verify no type/compile errors
npm run lint         # ESLint via next lint
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:push      # Push schema to DB without a migration file
npm run db:migrate   # Create and apply a named migration
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed cars (tsx prisma/seed.ts)
```

**No test runner is configured.** Do not invent test commands. If adding tests, use Vitest.

To run scripts directly:
```bash
npx tsx scripts/create-admin.ts <username> <password>
npx tsx scripts/seed-cars.ts
```

---

## Project Structure

```
app/
  (public)/          # Public-facing pages — Header/Footer layout
  (admin)/admin/     # Protected admin panel — sidebar layout, auth-gated
  (auth)/admin/      # Login page — no layout wrapper
  actions/           # Server Actions (cars, leads, images, documents, admin)
  api/               # Route handlers (leads POST, upload POST)
components/
  ui/                # Primitive components: Button, Input, Select, Badge, …
  forms/             # Form components: CompleteCarForm, ContactForm, …
  sections/          # Page sections: Hero, FeaturedCars, CarDetail, …
  layout/            # Header, Footer, AdminSidebar, Navigation
  admin/             # Admin-specific: CarsTable, ImageUploader, …
lib/
  data/              # Data-access layer — all Prisma queries go here
  schemas/           # Zod schemas and inferred types (car, contact, admin)
  constants/         # Shared option arrays (car-options.ts)
  auth.ts            # JWT + bcrypt helpers, cookie management
  prisma.ts          # Prisma singleton with PrismaPg adapter
  utils.ts           # cn(), formatPrice(), formatMileage(), etc.
  cloudinary.ts      # Cloudinary upload/delete helpers
  email.ts           # Resend email sending
  notifications.ts   # sileo toast wrappers
styles/
  variables.css      # All CSS custom properties (colors, spacing, typography)
  animations.css     # Shared keyframe animations
types/index.ts       # Re-exports schema types + shared interfaces
```

---

## Architecture Rules

### Server vs Client Components
- **Default to Server Components.** Add `'use client'` only when the component needs
  hooks, event handlers, or browser APIs.
- Pages are Server Components. Extract interactivity into named client wrappers
  (e.g. `CarsTableWrapper.tsx` next to `page.tsx`).
- Never put `'use client'` on a layout that wraps Server Component children.

### Data Fetching
- **All Prisma queries belong in `lib/data/`**, never directly in page files.
- Use `React.cache()` on functions called from both `generateMetadata` and the page
  component to avoid double queries.
- Server Actions live in `app/actions/`. They call `lib/data/` or Prisma directly.
  Always call `requireAuth()` first in every admin action.

### Middleware / Auth
- `proxy.ts` at the root is the Next.js 16 Edge middleware (replaces `middleware.ts`).
  Export the function as `proxy`, not `middleware`.
- Admin layout (`app/(admin)/admin/layout.tsx`) performs a server-side token check as
  a second layer. Both layers must remain in sync on the cookie name — always import
  `ADMIN_COOKIE_OPTIONS` from `lib/auth.ts`, never hardcode `'admin_session'`.

### Routing
- Use `<Link href="…">` from `next/link` for **all** internal navigation.
  Never use `<a href="…">` for same-domain paths.
- Build pagination URLs with `URLSearchParams`, never string concatenation.

---

## TypeScript

- **`strict: true`** is enabled. No implicit `any`.
- Avoid `as any`. If you must suppress, use `as unknown as TargetType` and add a comment.
- Avoid `eslint-disable` suppression comments. Fix the root cause.
- Infer types from Zod schemas (`z.infer<typeof schema>`). Do not manually duplicate
  types that already exist in `lib/schemas/`.
- Shared display types (enums, interfaces reused across multiple files) go in
  `types/index.ts` or a co-located `types.ts`. Never redefine the same type twice.
- Return types on exported functions are mandatory.

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase file + folder | `components/ui/Button/Button.tsx` |
| Hooks | `use` prefix, camelCase | `useDeleteCar` |
| Server Actions | verb + noun, camelCase | `createCar`, `updateLeadStatus` |
| Data functions | get/create/update/delete prefix | `getFeaturedCars`, `getDashboardStats` |
| Constants | SCREAMING_SNAKE_CASE | `FUEL_TYPE_OPTIONS`, `ADMIN_COOKIE_OPTIONS` |
| CSS modules | camelCase class names | `.filterInput`, `.sectionTitle` |
| Route groups | lowercase in parens | `(public)`, `(admin)`, `(auth)` |

---

## Styling

- **CSS Modules** for all component styles. No inline `style={{}}` props in production
  code. No hardcoded hex values — use CSS custom properties from `styles/variables.css`.
- **`cn()` from `lib/utils.ts`** for conditional class merging (wraps `clsx` + `twMerge`).
- All spacing, color, and typography values come from CSS variables:
  `--space-*`, `--color-*`, `--font-size-*`, `--font-weight-*`.
- Screen-reader-only content: use the `.sr-only` utility class, not `display: none`.

---

## Forms & Validation

- All forms use **react-hook-form** + **zodResolver** from `@hookform/resolvers/zod`.
- Schemas live in `lib/schemas/`. Spanish error messages throughout.
- Server Actions re-validate with the same Zod schema independently of the client.
- Honeypot field (`name="honeypot"`, `aria-hidden="true"`, `tabIndex={-1}`) required
  on all public-facing forms.
- Never return the raw Prisma record from a public API response. Strip to minimal fields.

---

## Error Handling

- Server Actions return `{ success: boolean; error?: string; data?: T }`. Never throw
  to the client — catch internally and return `{ success: false, error: '…' }`.
- `console.error(…)` is acceptable for server-side logging of unexpected errors.
  `console.log(…)` is **never** acceptable in committed code.
- Wrap every `requireAuth()` call in its own try/catch so a missing JWT_SECRET
  produces a controlled redirect, not an unhandled crash.

---

## Key Libraries

| Library | Purpose |
|---|---|
| `next` 16 | Framework — App Router, proxy.ts middleware |
| `prisma` 7 + `@prisma/adapter-pg` | ORM with pg driver adapter |
| `zod` | Schema validation (client + server) |
| `react-hook-form` | Form state management |
| `cloudinary` v2 | Image/document storage |
| `resend` | Transactional email |
| `sileo` | Toast notifications (`lib/notifications.ts` wrappers) |
| `framer-motion` | Animations (keep in Client Components only) |
| `lucide-react` | Icons |
| `clsx` + `tailwind-merge` | Class merging via `cn()` |
| `bcryptjs` + `jsonwebtoken` | Auth (BCRYPT_ROUNDS = 12, JWT 8 h) |

---

## Things to Never Do

- Never add `console.log` to committed code.
- Never call Prisma directly inside a page file — use `lib/data/`.
- Never hardcode the cookie name `'admin_session'` — import `ADMIN_COOKIE_OPTIONS.name`.
- Never define option arrays (fuel types, statuses, etc.) locally — import from
  `lib/constants/car-options.ts`.
- Never use `<a>` for internal links.
- Never redefine types that already exist in `lib/schemas/` or `types/index.ts`.
- Never add `force-dynamic` or `revalidate = 0` without a documented reason.
- Never run `npm run build` as a verification step during implementation — just lint.
