# 🎨 ColorLab AI

**Smart Hair Color Formulas for Professional Stylists**

Upload a photo of your client's hair and an inspiration image. AI analyzes both against a curated formula database and delivers the exact color formula, technique guide, and product list — in seconds.

---

## Quick Start

```bash
# Install
npm install

# Setup environment
cp .env.example .env.local
# Fill in your API keys (see below)

# Database
npx prisma db push
npx prisma generate
npx prisma db seed

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | ✅ | Claude API key from [console.anthropic.com](https://console.anthropic.com) |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `BLOB_READ_WRITE_TOKEN` | ✅ | Vercel Blob token for image uploads |
| `ADMIN_SECRET` | ✅ | Secret key for `/dashboard` access |
| `RESEND_API_KEY` | Optional | For sending lead gen welcome emails |
| `NEXT_PUBLIC_APP_URL` | Optional | Your deployed URL |

## Pages

- **`/`** — Marketing landing page with lead-gen waitlist
- **`/upload`** — Core app: upload photos → get formula
- **`/dashboard`** — Admin: manage formula database, view leads

## How It Works

1. **Upload** two photos (client + inspiration)
2. **AI analyzes** both using Claude Vision (detects level, tone, condition, technique needed)
3. **Database matching** against your curated before/after formula library
4. **Formula generated** with exact shades, developer, ratios, timing, and step-by-step guide

## Building Your Formula Database

The app's value scales directly with how many before/after entries you add. Go to `/dashboard` and add entries with:
- Before/after photos and hair descriptions
- Hair levels (1-10)
- Complete formula (brand, shades, developer, lightener, toner)
- Technique, processing times, difficulty, tags

## Deploy to Vercel

```bash
vercel
```

Set environment variables in the Vercel dashboard. The `/api/analyze` route is configured for 60-second max duration.

## Claude Code

See `CLAUDE_CODE_PROMPT.md` for a complete master prompt you can paste into Claude Code to have it build, modify, and extend this app autonomously.

---

Built with Next.js 14, Claude AI, Prisma, and Tailwind CSS.
