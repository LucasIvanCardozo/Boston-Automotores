# Boston Automotores - Deployment Guide

This guide covers deploying Boston Automotores to production using Vercel.

## Prerequisites

- Node.js 18.17 or later
- A Vercel account
- A PostgreSQL database (Vercel Postgres or external)
- A Cloudinary account for image storage

## Step 1: Prepare Your Repository

```bash
# Ensure all dependencies are installed
npm install

# Verify the build works locally
npm run build

# Test locally
npm run dev
```

## Step 2: Create a Vercel Project

### Option A: Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: `.` (or your project root)
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Option B: Via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

## Step 3: Configure Environment Variables

In your Vercel project dashboard, go to Settings → Environment Variables and add:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `CLOUDINARY_CLOUD_NAME` | Your cloud name | Required |
| `CLOUDINARY_API_KEY` | Your API key | Required |
| `CLOUDINARY_API_SECRET` | Your API secret | Required |
| `JWT_SECRET` | 32+ character random string | Required |
| `NEXT_PUBLIC_APP_URL` | Your production URL | e.g., https://bostonautomotores.com |
| `NEXT_PUBLIC_GA_ID` | GA4 Measurement ID | Optional |
| `RESEND_API_KEY` | Resend API key | Optional |
| `ADMIN_EMAIL` | Admin notification email | Optional |
| `FROM_EMAIL` | From email address | Optional |

### Generating a Secure JWT_SECRET

```bash
# macOS / Linux
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) )
```

## Step 4: Configure the Database

### If Using Vercel Postgres

1. Create a new Vercel Postgres database
2. Note the `DATABASE_URL` from the connection details
3. Add it to your environment variables

### Run Migrations

```bash
# Using Prisma CLI
npx prisma migrate deploy

# Or in your deployment pipeline
DATABASE_URL="your-connection-string" npx prisma migrate deploy
```

### Seed the Database (Optional)

```bash
# Create initial admin user
npx tsx scripts/create-admin.ts
```

## Step 5: Configure Cloudinary

1. Log in to [Cloudinary](https://cloudinary.com)
2. Go to Dashboard → Account Details
3. Copy Cloud Name, API Key, and API Secret
4. Add them to Vercel environment variables
5. Update your `next.config.mjs` if needed

## Step 6: Configure Custom Domain (Optional)

1. In Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., `bostonautomotores.com`)
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning

## Step 7: Set Next_PUBLIC_APP_URL

Once your domain is configured, set:

```
NEXT_PUBLIC_APP_URL=https://bostonautomotores.com
```

This is used for:
- Sitemap generation
- OpenGraph image URLs
- Canonical URLs

## Post-Deployment Checklist

### Functional Verification

- [ ] Homepage loads correctly
- [ ] Car catalog displays properly
- [ ] Car detail pages work
- [ ] Contact form submissions work
- [ ] "Sell Your Car" form works
- [ ] Admin login works
- [ ] Image uploads work
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Robots.txt accessible at `/robots.txt`

### Security Verification

- [ ] Admin routes require authentication
- [ ] API routes are protected
- [ ] Database credentials are secure
- [ ] No source maps expose code in production
- [ ] Security headers are present

### Performance Verification

- [ ] Images are optimized (WebP/AVIF)
- [ ] Fonts are preconnected
- [ ] Google Analytics loads (if configured)
- [ ] No console errors
- [ ] Lighthouse score > 90

### SEO Verification

- [ ] Meta tags present on all pages
- [ ] OpenGraph images working
- [ ] Sitemap submitted to Google Search Console
- [ ] robots.txt allows crawling
- [ ] Structured data (Schema.org) implemented

## Troubleshooting

### Build Fails

```bash
# Check for TypeScript errors
npm run build

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check if your IP is whitelisted (for external PostgreSQL)
3. Ensure the database exists

### Images Not Loading

1. Verify Cloudinary credentials
2. Check Cloudinary account has not exceeded limits
3. Verify `next.config.mjs` has correct `remotePatterns`

### Authentication Not Working

1. Verify `JWT_SECRET` is set and consistent
2. Check browser allows cookies
3. Clear site data and try again

## Monitoring

### Vercel Analytics

Enable Vercel Analytics in your project settings for:
- Core Web Vitals
- User interactions
- Performance metrics

### Error Tracking

Consider adding an error tracking service:
- Sentry
- LogRocket
- Datadog

## Updates & Maintenance

### Pulling Updates

```bash
git pull origin main
npm install
npm run build
```

### Database Migrations

Always run migrations before deploying:

```bash
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

## Support

For issues specific to this deployment, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://prisma.io/docs)
