# ═══════════════════════════════════════════════════════════════
# ColorLab AI — Complete Setup & Deployment Guide
# ═══════════════════════════════════════════════════════════════

## Table of Contents
1. [Quick Start (Automated)](#quick-start-automated)
2. [Manual Setup Step-by-Step](#manual-setup-step-by-step)
3. [Database Setup Options](#database-setup-options)
4. [Environment Variables Reference](#environment-variables-reference)
5. [Deploy to Vercel](#deploy-to-vercel)
6. [Deploy with Docker](#deploy-with-docker)
7. [Populating the Formula Database](#populating-the-formula-database)
8. [Lead Gen System](#lead-gen-system)
9. [Monitoring & Health Checks](#monitoring--health-checks)
10. [Troubleshooting](#troubleshooting)

---

## Quick Start (Automated)

```bash
chmod +x setup.sh
./setup.sh
```

The script walks you through everything interactively — installs deps, sets up env vars, optionally starts Docker Postgres, pushes the schema, seeds sample data, and verifies the build.

---

## Manual Setup Step-by-Step

### Prerequisites
- Node.js 18+ (20 recommended)
- PostgreSQL 14+ (local, Docker, Vercel Postgres, Supabase, Neon, or Railway)
- Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env.local

# 3. Edit .env.local — fill in at minimum:
#    ANTHROPIC_API_KEY=sk-ant-your-key
#    DATABASE_URL=postgresql://user:pass@host:5432/colorlab
#    ADMIN_SECRET=any-secret-string-min-8-chars

# 4. Generate Prisma client
npx prisma generate

# 5. Push schema to database
npx prisma db push

# 6. Seed sample formula data (optional but recommended)
npx prisma db seed

# 7. Start dev server
npm run dev
```

---

## Database Setup Options

### Option A: Docker (recommended for local dev)

```bash
docker compose up -d
```

This starts PostgreSQL on port 5432 with:
- User: `colorlab`
- Password: `colorlab_dev`
- Database: `colorlab`
- Connection: `postgresql://colorlab:colorlab_dev@localhost:5432/colorlab`

The `database.sql` file auto-runs on first start, creating all tables + sample data.

To also start pgAdmin (web-based DB browser):
```bash
docker compose --profile tools up -d
# Then open http://localhost:5050 (login: admin@colorlab.ai / admin)
```

### Option B: Raw SQL (any Postgres instance)

If you can't use Prisma migrations (e.g., managed database with restrictions):

```bash
psql -U your_user -d colorlab -f database.sql
```

Or paste the contents of `database.sql` into your database GUI (pgAdmin, TablePlus, Supabase SQL Editor, etc.)

### Option C: Vercel Postgres (production)

1. Go to your Vercel project → Storage → Create Database → Postgres
2. Copy the `DATABASE_URL` it gives you
3. Paste into your `.env.local` and Vercel environment variables
4. Run: `npx prisma db push`

### Option D: Supabase / Neon / Railway

All work the same way — get the PostgreSQL connection string, paste it as `DATABASE_URL`, then run `npx prisma db push`.

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | **Yes** | — | Claude API key (starts with `sk-ant-`) |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string |
| `ADMIN_SECRET` | **Yes** | — | Password for `/dashboard` admin panel (min 8 chars) |
| `BLOB_READ_WRITE_TOKEN` | For uploads | — | Vercel Blob token for image persistence |
| `RESEND_API_KEY` | For emails | — | Resend.com key for lead gen welcome emails |
| `NEXT_PUBLIC_APP_URL` | Recommended | `http://localhost:3000` | Your deployed URL (used in emails, sitemap, OG tags) |
| `NEXT_PUBLIC_APP_NAME` | No | `ColorLab AI` | App display name |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | — | PostHog analytics key |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | — | PostHog instance URL |

---

## Deploy to Vercel

### First-time deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (follow prompts)
vercel
```

### Set environment variables

In the Vercel dashboard → Project → Settings → Environment Variables, add:
- `ANTHROPIC_API_KEY`
- `DATABASE_URL` (from Vercel Postgres or external DB)
- `ADMIN_SECRET`
- `BLOB_READ_WRITE_TOKEN` (from Vercel Blob storage)
- `RESEND_API_KEY` (optional)
- `NEXT_PUBLIC_APP_URL` (your `*.vercel.app` or custom domain)

### Set up Vercel Postgres

1. Vercel Dashboard → Storage → Create Database → Postgres
2. It auto-populates `DATABASE_URL` in your project's env vars
3. Run `npx prisma db push` locally (or use Vercel CLI)

### Set up Vercel Blob

1. Vercel Dashboard → Storage → Create Store → Blob
2. Copy the `BLOB_READ_WRITE_TOKEN`
3. Add to environment variables

### Custom domain

1. Vercel Dashboard → Project → Settings → Domains
2. Add your domain, follow DNS instructions
3. Update `NEXT_PUBLIC_APP_URL` to match

---

## Deploy with Docker

```bash
# Build the image
docker build -t colorlab-ai .

# Run with env file
docker run -p 3000:3000 --env-file .env.local colorlab-ai
```

For Docker Compose (app + database together):
```bash
docker compose up -d
```

---

## Populating the Formula Database

The formula database is the core value of the app. More entries = better AI recommendations.

### Method 1: Admin Dashboard (UI)

1. Go to `/dashboard`
2. Enter your `ADMIN_SECRET`
3. Click "Add Entry"
4. Fill in before/after details, formula, and metadata
5. Save

### Method 2: CSV Import (Bulk)

```bash
npx ts-node scripts/import-formulas.ts ./your-formulas.csv
```

See `scripts/sample-formulas.csv` for the expected format. Multi-value fields (tags, shades, additives) use semicolons as separators.

### Method 3: API

```bash
curl -X POST https://your-app.vercel.app/api/formulas \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: YOUR_ADMIN_SECRET" \
  -d '{
    "beforeHairColor": "Level 5 warm brown",
    "afterHairColor": "Level 8 cool blonde balayage",
    "beforeLevel": 5,
    "afterLevel": 8,
    "technique": "Balayage",
    "formulaDetails": "Full formula text...",
    "colorBrand": "Redken",
    "tags": ["balayage", "blonde"]
  }'
```

### What to include in each entry

**Required:**
- Before/after hair color descriptions
- Technique name
- Full formula details (the more specific, the better)

**Highly recommended:**
- Before/after hair levels (1-10)
- Color brand and shade numbers
- Developer volume and ratio
- Lightener details if applicable
- Toner formula if applicable
- Processing times
- Tags for matching

---

## Lead Gen System

### How it works

1. Visitor lands on `/` (marketing page)
2. Scrolls to waitlist section, enters email
3. Email saved to `Lead` table with UTM params
4. Optional: Resend sends welcome email automatically
5. Admin views all leads at `/dashboard` → Leads tab

### UTM Tracking

Links with UTM params are auto-captured:
```
https://your-app.com/?utm_source=instagram&utm_medium=bio&utm_campaign=launch
```

### Email Drip Templates

Pre-built templates in `lib/email-templates.ts`:
1. **Welcome** — sent immediately on signup
2. **How It Works** — send 2 days later
3. **Social Proof** — send 5 days later

To implement the drip: set up a cron job (Vercel Cron, GitHub Actions schedule, or a service like Inngest) that queries leads by `emailsSent` count and sends the next template.

---

## Monitoring & Health Checks

### Health endpoint

```
GET /api/health
```

Returns:
```json
{
  "status": "ok",
  "database": "connected",
  "anthropicKey": "configured",
  "blobStorage": "configured",
  "counts": { "formulas": 3, "leads": 12, "submissions": 47 }
}
```

### Prisma Studio

```bash
npx prisma studio
```

Opens a web UI at `http://localhost:5555` to browse and edit all database tables.

---

## Troubleshooting

### "Cannot connect to database"
- Check your `DATABASE_URL` in `.env.local`
- Make sure PostgreSQL is running (`docker compose up -d` or check your provider)
- Try: `npx prisma db push` to re-sync schema

### "Analysis fails with 500 error"
- Check `ANTHROPIC_API_KEY` is set correctly
- Check the Anthropic API dashboard for rate limits or billing issues
- Check server logs: the API returns fallback data if JSON parsing fails

### "Build fails"
- Run `npx prisma generate` first (needed before build)
- Check that all required env vars are set
- For CI/CD, set placeholder values for env vars during build

### "Images don't persist"
- Set up `BLOB_READ_WRITE_TOKEN` for Vercel Blob storage
- Without it, images are sent as base64 in the API call (still works, just doesn't persist)

### "Emails not sending"
- Set `RESEND_API_KEY` in environment
- Verify your sending domain in the Resend dashboard
- Check the Resend logs for delivery status

### "Admin dashboard shows nothing"
- Make sure you're using the correct `ADMIN_SECRET`
- Run `npx prisma db seed` to populate sample data
- Check `/api/health` to verify database connection
