# Technical Design: Boston Automotores Website

## 1. System Architecture

### Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Home Page   │  │ Catalog Page │  │   Admin Dashboard    │  │
│  │   (RSC)      │  │    (RSC)     │  │      (RSC)           │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                     │              │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────────┴───────────┐  │
│  │   Client     │  │   Client     │  │      Client          │  │
│  │ Components   │  │ Components   │  │    Components        │  │
│  │ (Forms,      │  │ (Filters,    │  │ (Image Uploader,     │  │
│  │  Carousel)   │  │  Gallery)    │  │   Data Tables)       │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
└─────────┼─────────────────┼─────────────────────┼──────────────┘
          │                 │                     │
          └─────────────────┴─────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      DOMAIN LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │    Car       │  │    Lead      │  │      Admin           │  │
│  │   Entity     │  │   Entity     │  │     Entity           │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │CreateCar     │  │SubmitContact │                             │
│  │  Use Case    │  │   Use Case   │                             │
│  └──────────────┘  └──────────────┘                             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Prisma     │  │  Cloudinary  │  │   NextAuth/JWT       │  │
│  │  Repository  │  │   Storage    │  │      Auth            │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │  PostgreSQL  │  │  Resend      │                             │
│  │   Database   │  │    Email     │                             │
│  └──────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

**Read Flow (Server Components)**
```
User Request → Next.js Router → Server Component → Prisma → PostgreSQL
                                                    ↓
User ← HTML Response ← Rendered Component ← Data
```

**Write Flow (Server Actions)**
```
User Form Submit → Server Action → Zod Validation → Prisma → PostgreSQL
                                          ↓
                   Success/Error ← Revalidate Tag ← Cache Invalidation
```

**Image Upload Flow**
```
Admin Select → Client Validation → Base64 Encode → API Route → Cloudinary
                                                      ↓
                   Preview Update ← URL Response ← Transform & Store
```

---

## 2. Database Design

### Prisma Schema (Refined)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Car {
  id                String    @id @default(cuid())
  brand             String
  model             String
  year              Int
  price             Decimal   @db.Decimal(12, 2)
  mileage           Int       // kilometers
  fuelType          FuelType
  transmission      Transmission
  status            CarStatus @default(available)
  featured          Boolean   @default(false)
  description       String?   @db.Text
  features          String[]  // Array of feature strings
  
  // Relations
  images            Image[]
  technicalSheet    TechnicalSheet?
  
  // Soft delete
  deletedAt         DateTime?
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([brand])
  @@index([status])
  @@index([featured])
  @@index([deletedAt])
  @@index([price])
  @@index([year])
  @@index([createdAt])
  @@map("cars")
}

model Image {
  id          String   @id @default(cuid())
  publicId    String   // Cloudinary public_id
  url         String
  secureUrl   String
  width       Int?
  height      Int?
  format      String?
  order       Int      @default(0)
  
  // Relations
  car         Car      @relation(fields: [carId], references: [id], onDelete: Cascade)
  carId       String
  
  createdAt   DateTime @default(now())
  
  @@index([carId])
  @@index([order])
  @@map("images")
}

model TechnicalSheet {
  id          String   @id @default(cuid())
  publicId    String   // Cloudinary public_id
  url         String
  filename    String
  
  // Relations
  car         Car      @relation(fields: [carId], references: [id], onDelete: Cascade)
  carId       String   @unique
  
  uploadedAt  DateTime @default(now())
  
  @@map("technical_sheets")
}

model Lead {
  id          String      @id @default(cuid())
  type        LeadType
  name        String
  email       String
  phone       String
  
  // Car details (for sell-my-car submissions)
  carBrand    String?
  carModel    String?
  carYear     Int?
  carMileage  Int?
  message     String?     @db.Text
  
  // Status tracking
  status      LeadStatus  @default(new)
  contactedAt DateTime?
  
  // Honeypot (spam protection)
  honeypot    String?     // Should be empty
  
  // Metadata
  sourcePage  String      // URL where form was submitted
  ipAddress   String?     // For rate limiting
  
  // Timestamps
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  @@index([status])
  @@index([type])
  @@index([createdAt])
  @@map("leads")
}

model Admin {
  id            String    @id @default(cuid())
  username      String    @unique
  passwordHash  String
  role          AdminRole @default(admin)
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  
  @@map("admins")
}

model SiteConfig {
  id        String   @id @default(cuid())
  key       String   @unique
  value     Json
  updatedAt DateTime @updatedAt
  
  @@map("site_config")
}

// Enums
enum CarStatus {
  available
  sold
  reserved
}

enum FuelType {
  nafta
  diesel
  electrico
  hibrido
  gnc
}

enum Transmission {
  manual
  automatica
  cvt
}

enum LeadType {
  sell_car
  contact
}

enum LeadStatus {
  new
  contacted
  closed
}

enum AdminRole {
  admin
  super_admin
}
```

### Indexing Strategy

| Index | Fields | Purpose |
|-------|--------|---------|
| `cars_brand_idx` | brand | Filter by brand |
| `cars_status_idx` | status | Filter available cars |
| `cars_featured_idx` | featured | Home page featured query |
| `cars_deletedAt_idx` | deletedAt | Soft delete filtering |
| `cars_price_idx` | price | Sort by price |
| `cars_year_idx` | year | Sort/filter by year |
| `cars_createdAt_idx` | createdAt | Default sort order |
| `images_carId_idx` | carId | Join optimization |
| `images_order_idx` | order | Gallery ordering |
| `leads_status_idx` | status | Admin filtering |
| `leads_type_idx` | type | Filter by lead type |
| `leads_createdAt_idx` | createdAt | Sort by date |

### Migration Strategy

1. **Initial Migration**: `prisma migrate dev --name init`
2. **Subsequent Changes**: Always create new migrations
3. **Production**: `prisma migrate deploy`
4. **Seeding**: Use `prisma/seed.ts` for initial admin and test data

---

## 3. Component Architecture

### Server vs Client Component Boundaries

**Server Components (Default)**
- All page.tsx files
- Layout components
- Data fetching wrappers
- Static sections

**Client Components ('use client')**
- Forms (react-hook-form)
- Interactive galleries
- Carousels/sliders
- Drag-and-drop uploads
- Real-time filters
- Animation wrappers

### Component Hierarchy

```
App (Root Layout)
├── Providers (Client)
│   └── AuthProvider
├── Header (Server)
│   ├── Logo (Server)
│   └── Navigation (Server)
├── Main Content (Server)
│   └── Page Specific
│       ├── HeroSection (Server)
│       │   └── AnimatedHero (Client - Framer Motion)
│       ├── FeaturedCars (Server)
│       │   └── CarCarousel (Client)
│       │       └── CarCard (Server)
│       ├── MetricsSection (Server)
│       │   └── AnimatedCounter (Client)
│       └── ...
└── Footer (Server)
```

### Props Patterns

**Data Components** (Server)
```typescript
interface CarCardProps {
  car: {
    id: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    images: { url: string }[];
  };
}

// Usage
export function CarCard({ car }: CarCardProps) {
  return (
    <article className={styles.card}>
      <Image src={car.images[0]?.url} alt={`${car.brand} ${car.model}`} />
      <h3>{car.brand} {car.model}</h3>
      <p>${car.price.toLocaleString('es-AR')}</p>
    </article>
  );
}
```

**Interactive Components** (Client)
```typescript
'use client';

interface CarFormProps {
  initialData?: Car;
  onSubmit: (data: CarFormData) => Promise<void>;
}

export function CarForm({ initialData, onSubmit }: CarFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CarFormData>({
    defaultValues: initialData,
    resolver: zodResolver(carSchema)
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

---

## 4. Animation Strategy

### CSS Animations (Tier 1)

```css
/* Base transitions */
.transition-base {
  transition: all var(--transition-fast) ease-out;
}

/* Card hover effects */
.card-hover {
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

/* Fade in animation */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn var(--transition-normal) ease-out;
}

/* Slide up animation */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-up {
  animation: slideUp var(--transition-normal) ease-out;
}

/* Count up animation for metrics */
@keyframes countUp {
  from { --num: 0; }
  to { --num: var(--target); }
}
```

### Framer Motion Usage (Tier 2)

```typescript
// Hero section entrance
const heroVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.15
    }
  }
};

// Staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  }
};

// Scroll-triggered animations
const scrollRevealVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  }
};

// Usage
<motion.section
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-100px" }}
  variants={scrollRevealVariants}
>
  {/* Content */}
</motion.section>
```

### Performance Considerations

1. **Use `transform` and `opacity`** - GPU-accelerated properties only
2. **Add `will-change` sparingly** - Only on elements that will animate
3. **Use `@media (prefers-reduced-motion)`** - Respect user preferences
4. **Lazy load animation libraries** - Dynamic import Framer Motion
5. **Debounce scroll handlers** - Use Intersection Observer instead

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 5. Server Actions Design

### Action Signatures

```typescript
// app/actions/cars.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { carSchema } from '@/lib/schemas';

export async function createCar(formData: FormData) {
  // Parse form data
  const rawData = Object.fromEntries(formData);
  
  // Validate
  const result = carSchema.safeParse(rawData);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors
    };
  }
  
  try {
    const car = await prisma.car.create({
      data: result.data
    });
    
    revalidatePath('/catalogo');
    revalidatePath('/admin/cars');
    
    return { success: true, carId: car.id };
  } catch (error) {
    return {
      success: false,
      error: 'Error al crear el vehículo'
    };
  }
}

export async function updateCar(id: string, formData: FormData) {
  const rawData = Object.fromEntries(formData);
  const result = carSchema.safeParse(rawData);
  
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }
  
  try {
    await prisma.car.update({
      where: { id },
      data: result.data
    });
    
    revalidatePath(`/catalogo/${id}`);
    revalidatePath('/catalogo');
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error al actualizar' };
  }
}

export async function deleteCar(id: string) {
  try {
    await prisma.car.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    
    revalidatePath('/catalogo');
    revalidatePath('/admin/cars');
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error al eliminar' };
  }
}
```

### Error Handling Pattern

```typescript
// lib/actions/types.ts
interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
  error?: string;
}

// Usage in components
'use client';

export function CarForm() {
  const [state, formAction] = useFormState(createCar, { success: false });
  
  return (
    <form action={formAction}>
      {/* Form fields */}
      {state.errors?.brand && (
        <span className={styles.error}>{state.errors.brand[0]}</span>
      )}
      {state.error && (
        <div className={styles.globalError}>{state.error}</div>
      )}
    </form>
  );
}
```

### Revalidation Strategy

| Action | Revalidate Paths |
|--------|------------------|
| createCar | `/catalogo`, `/admin/cars`, `/` |
| updateCar | `/catalogo/[id]`, `/catalogo`, `/admin/cars` |
| deleteCar | `/catalogo`, `/admin/cars`, `/` |
| toggleFeatured | `/` |
| submitLead | `/admin/leads` |

---

## 6. Authentication Flow

### Login Sequence

```
1. User submits credentials
   ↓
2. POST /api/admin/login
   ↓
3. Validate username/password with bcrypt
   ↓
4. Create JWT with admin ID + role
   ↓
5. Set httpOnly cookie with token
   ↓
6. Redirect to /admin
```

### Session Validation

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const auth = await verifyAuth(request);
    
    if (!auth) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
```

### Logout Flow

```typescript
// app/actions/admin.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('boston_session');
  redirect('/');
}
```

---

## 7. File Structure

### Complete Directory Tree

```
boston-automotores/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                    # Home
│   │   ├── layout.tsx                  # Root layout
│   │   ├── loading.tsx                 # Loading UI
│   │   ├── error.tsx                   # Error boundary
│   │   ├── globals.css                 # Global styles
│   │   │
│   │   ├── catalogo/
│   │   │   ├── page.tsx                # Catalog listing
│   │   │   ├── loading.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # Car detail
│   │   │       ├── loading.tsx
│   │   │       └── not-found.tsx
│   │   │
│   │   ├── nosotros/
│   │   │   └── page.tsx                # About us
│   │   │
│   │   └── vende-tu-auto/
│   │       └── page.tsx                # Sell my car
│   │
│   ├── (admin)/
│   │   └── admin/
│   │       ├── layout.tsx              # Admin layout (protected)
│   │       ├── page.tsx                # Admin dashboard
│   │       ├── login/
│   │       │   └── page.tsx            # Login page
│   │       │
│   │       ├── autos/
│   │       │   ├── page.tsx            # Car list
│   │       │   ├── nuevo/
│   │       │   │   └── page.tsx        # Create car
│   │       │   └── [id]/
│   │       │       └── editar/
│   │       │           └── page.tsx    # Edit car
│   │       │
│   │       └── consultas/
│   │           └── page.tsx            # View leads
│   │
│   ├── api/
│   │   └── upload/
│   │       └── route.ts                # Upload handler
│   │
│   └── actions/
│       ├── cars.ts                     # Car CRUD actions
│       ├── contact.ts                  # Contact form actions
│       └── admin.ts                    # Admin auth actions
│
├── components/
│   ├── ui/                             # Primitive components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── Button.module.css
│   │   ├── Input/
│   │   ├── Select/
│   │   ├── Card/
│   │   ├── Badge/
│   │   └── Loading/
│   │
│   ├── layout/                         # Layout components
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── Navigation/
│   │   └── AdminSidebar/
│   │
│   ├── sections/                       # Page sections
│   │   ├── Hero/
│   │   ├── FeaturedCars/
│   │   ├── CarGrid/
│   │   ├── CarDetail/
│   │   ├── ContactForm/
│   │   ├── Metrics/
│   │   ├── InstagramFeed/
│   │   └── LocationMap/
│   │
│   ├── forms/                          # Form components
│   │   ├── SellCarForm/
│   │   ├── CarFilterForm/
│   │   └── AdminCarForm/
│   │
│   └── admin/                          # Admin components
│       ├── AdminTable/
│       ├── ImageUploader/
│       └── LoginForm/
│
├── lib/
│   ├── prisma.ts                       # Prisma client singleton
│   ├── cloudinary.ts                   # Cloudinary config
│   ├── auth.ts                         # Auth utilities
│   ├── utils.ts                        # General utilities
│   │
│   └── schemas/                        # Zod schemas
│       ├── car.ts
│       ├── contact.ts
│       └── admin.ts
│
├── hooks/                              # Custom hooks
│   ├── useAuth.ts
│   ├── useCars.ts
│   └── useUpload.ts
│
├── types/                              # TypeScript types
│   ├── car.ts
│   ├── lead.ts
│   └── api.ts
│
├── styles/
│   ├── variables.css                   # CSS custom properties
│   └── animations.css                  # Keyframe animations
│
├── prisma/
│   └── schema.prisma                   # Database schema
│
├── public/
│   └── assets/
│       ├── default.png
│       └── logo.svg
│
├── scripts/
│   └── create-admin.ts                 # Admin creation script
│
├── middleware.ts                       # Next.js middleware
├── next.config.js
├── tsconfig.json
├── package.json
└── .env.local.example
```

### Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Components | PascalCase | `CarCard.tsx` |
| Pages | page.tsx | `app/catalogo/page.tsx` |
| Styles | Component.module.css | `Button.module.css` |
| Server Actions | camelCase.ts | `createCar.ts` |
| Utilities | camelCase.ts | `formatPrice.ts` |
| Types | PascalCase.ts | `Car.types.ts` |
| Hooks | use + PascalCase | `useAuth.ts` |

---

## 8. Styling Architecture

### CSS Custom Properties

```css
/* styles/variables.css */
:root {
  /* Brand Colors */
  --color-primary: #0F6BBE;
  --color-primary-dark: #0F3B9C;
  --color-background: #E4E5DD;
  --color-surface: #FFFFFF;
  --color-text: #000000;
  --color-text-muted: #666666;
  --color-text-inverse: #FFFFFF;
  --color-border: #E0E0E0;
  --color-error: #DC2626;
  --color-success: #16A34A;
  
  /* Typography */
  --font-family-base: system-ui, -apple-system, sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 2rem;
  --font-size-4xl: 2.5rem;
  
  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  
  /* Layout */
  --container-max: 1280px;
  --container-padding: 1rem;
  
  /* Transitions */
  --transition-fast: 150ms;
  --transition-normal: 300ms;
  --transition-slow: 500ms;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}

/* Responsive font sizes */
@media (min-width: 768px) {
  :root {
    --font-size-4xl: 3rem;
    --container-padding: 2rem;
  }
}
```

### Breakpoints

```css
/* Mobile First Approach */
/* Base: 0-639px (mobile) */
/* sm: 640px+ */
/* md: 768px+ */
/* lg: 1024px+ */
/* xl: 1280px+ */
```

### Component Patterns

```css
/* Button variants */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3) var(--space-6);
  font-size: var(--font-size-base);
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast) ease-out;
  cursor: pointer;
}

.buttonPrimary {
  composes: button;
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
}

.buttonPrimary:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.buttonSecondary {
  composes: button;
  background-color: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.buttonSecondary:hover {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

/* Container */
.container {
  width: 100%;
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--container-padding);
}

/* Section spacing */
.section {
  padding: var(--space-12) 0;
}

.sectionLg {
  composes: section;
  padding: var(--space-16) 0;
}
```

---

## 9. Error Handling

### Error Boundaries

```typescript
// components/ErrorBoundary.tsx
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // TODO: Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className={styles.errorContainer}>
          <h2>Algo salió mal</h2>
          <p>Por favor, intenta recargar la página</p>
          <button onClick={() => window.location.reload()}>
            Recargar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Error Types

| Error Type | Handler | User Message |
|------------|---------|--------------|
| ValidationError | Form inline display | Field-specific message |
| NotFoundError | 404 page | "Página no encontrada" |
| AuthError | Redirect to login | "Sesión expirada" |
| ServerError | Error boundary | "Error del servidor" |
| NetworkError | Retry button | "Error de conexión" |

### User-Facing Error Messages

```typescript
// lib/errors/messages.ts
export const errorMessages = {
  generic: 'Algo salió mal. Por favor, intenta nuevamente.',
  notFound: 'La página que buscas no existe.',
  unauthorized: 'No tienes permisos para acceder a esta página.',
  validation: {
    required: 'Este campo es obligatorio',
    email: 'Ingresa un email válido',
    phone: 'Ingresa un teléfono válido',
    minLength: (n: number) => `Mínimo ${n} caracteres`,
    maxLength: (n: number) => `Máximo ${n} caracteres`
  },
  server: {
    create: 'Error al crear el registro',
    update: 'Error al actualizar el registro',
    delete: 'Error al eliminar el registro',
    upload: 'Error al subir el archivo'
  }
} as const;
```

---

## 10. Performance Strategy

### Caching Layers

```typescript
// 1. React Server Component Cache (Next.js)
export const revalidate = 3600; // 1 hour

// 2. Data Cache with Prisma
import { cache } from 'react';

export const getCarById = cache(async (id: string) => {
  return prisma.car.findUnique({
    where: { id },
    include: { images: true }
  });
});

// 3. Static Page Generation (ISR)
// app/catalogo/[id]/page.tsx
export async function generateStaticParams() {
  const cars = await prisma.car.findMany({
    where: { deletedAt: null },
    select: { id: true }
  });
  
  return cars.map((car) => ({ id: car.id }));
}

export const revalidate = 3600;
```

### Image Optimization

```typescript
// next.config.js
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/your-cloud/**'
      }
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  }
};
```

```typescript
// Component usage
<Image
  src={car.images[0].url}
  alt={`${car.brand} ${car.model}`}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={isHero} // true for above-fold images
  className={styles.image}
/>
```

### Code Splitting

```typescript
// Dynamic imports for heavy components
const CarCarousel = dynamic(
  () => import('@/components/sections/CarCarousel'),
  {
    loading: () => <CarouselSkeleton />,
    ssr: false // Client-only component
  }
);

const ImageLightbox = dynamic(
  () => import('@/components/ImageLightbox'),
  {
    loading: () => <LoadingSpinner />
  }
);
```

### Performance Checklist

- [ ] Use Server Components by default
- [ ] Lazy load below-fold content
- [ ] Optimize images with next/image
- [ ] Use CSS Modules (zero runtime)
- [ ] Dynamic import heavy components
- [ ] Add proper loading states
- [ ] Implement proper error boundaries
- [ ] Use `will-change` sparingly
- [ ] Preconnect to Cloudinary
- [ ] Set proper cache headers

---

*Technical Design created: 2026-03-26*
*Based on: sdd/boston-automotores/proposal*
*Status: Ready for Implementation*
