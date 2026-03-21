# ═══════════════════════════════════════════════════════════════
# COLORLAB AI — MASTER CLAUDE CODE PROMPT
# ═══════════════════════════════════════════════════════════════
# Copy this entire file and paste it as your first message
# when starting a Claude Code session for this project.
# ═══════════════════════════════════════════════════════════════

You are building and maintaining **ColorLab AI**, a Next.js 14 web app that helps professional hair stylists generate color formulas by analyzing two uploaded photos (client's current hair + inspiration photo) against a curated before/after formula database.

## PROJECT OVERVIEW

**What the app does:**
1. A stylist uploads 2 photos: (a) their client's current hair, (b) an inspiration/goal photo
2. The AI (Claude Vision) analyzes both images to detect hair level (1-10), tone, condition, porosity, technique needed
3. The AI cross-references a curated PostgreSQL database of proven before/after transformations with detailed formulas (color brand, shades, developer, lightener, toner, ratios, processing times)
4. The AI generates a complete formula recommendation with step-by-step technique guide
5. The app also has a lead-gen landing page to capture hairstylist emails for a waitlist

**Tech Stack:**
- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS with custom theme (warm salon palette — cream, caramel, espresso, copper)
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514) with Vision for image analysis
- **Database:** PostgreSQL via Prisma ORM (Vercel Postgres in production)
- **Image Storage:** Vercel Blob
- **Email:** Resend (for lead gen welcome emails)
- **Deployment:** Vercel

## DIRECTORY STRUCTURE

```
colorlab/
├── app/
│   ├── globals.css            # Global styles, fonts, animations
│   ├── layout.tsx             # Root layout with metadata
│   ├── page.tsx               # Marketing landing page (lead gen)
│   ├── upload/
│   │   ├── layout.tsx
│   │   └── page.tsx           # Main upload → analyze → results flow
│   ├── dashboard/
│   │   └── page.tsx           # Admin dashboard (formula DB manager)
│   └── api/
│       ├── analyze/route.ts   # POST — main AI analysis endpoint
│       ├── formulas/route.ts  # CRUD — admin formula database
│       ├── leads/route.ts     # POST/GET — lead capture
│       └── upload/route.ts    # POST — image upload to Vercel Blob
├── lib/
│   ├── ai-engine.ts           # Core AI pipeline (analyze → match → recommend)
│   ├── prisma.ts              # Prisma client singleton
│   └── utils.ts               # Helpers (cn, formatters, file utils)
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Sample formula seed data
├── .env.example               # Environment variables template
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vercel.json
└── next.config.js
```

## SETUP INSTRUCTIONS (run these in order)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template and fill in your keys
cp .env.example .env.local
# Edit .env.local with your actual keys:
#   - ANTHROPIC_API_KEY (required — get from console.anthropic.com)
#   - DATABASE_URL (required — Vercel Postgres or any Postgres)
#   - BLOB_READ_WRITE_TOKEN (required for image uploads — from Vercel dashboard)
#   - RESEND_API_KEY (optional — for lead gen emails)
#   - ADMIN_SECRET (required — make up a secret for /dashboard access)

# 3. Push database schema
npx prisma db push

# 4. Generate Prisma client
npx prisma generate

# 5. Seed the database with sample formulas
npx prisma db seed

# 6. Start dev server
npm run dev
```

## KEY PAGES

| Route | Purpose |
|-------|---------|
| `/` | Marketing landing page with waitlist signup (lead gen) |
| `/upload` | Main app — upload 2 photos → get formula |
| `/dashboard` | Admin panel — manage formula database, view leads, stats |
| `/api/analyze` | POST endpoint — runs the full AI pipeline |
| `/api/formulas` | CRUD endpoint — admin formula management |
| `/api/leads` | POST/GET — lead capture and listing |
| `/api/upload` | POST — image upload to Vercel Blob |

## THE AI PIPELINE (lib/ai-engine.ts)

The analysis runs in 4 sequential steps:
1. **analyzeClientHair()** — Claude Vision reads the client photo → returns structured JSON (level, tone, undertone, condition, porosity, texture, pattern, gray %)
2. **analyzeInspoHair()** — Claude Vision reads the inspo photo → returns target level, tone, technique, placement, dimensionality
3. **findSimilarFormulas()** — Queries Prisma/Postgres for matching before→after entries by technique, level range, and tags
4. **generateRecommendation()** — Sends both images + analysis data + matched DB entries to Claude → returns complete formula with steps, warnings, tips

## DATABASE SCHEMA HIGHLIGHTS

- **FormulaEntry** — The core table YOU populate. Each row is a before/after transformation with: images, hair levels, full formula (brand, shades, developer, lightener, toner, ratios), technique, tags, difficulty, time estimate.
- **Submission** — Each user analysis creates a submission with the uploaded images and AI-detected metadata.
- **Analysis** — The AI result attached to each submission (summary, formula, matched entries, confidence score).
- **Lead** — Waitlist signups with UTM tracking and email engagement metrics.
- **Stylist** — Optional user accounts for logged-in stylists.

## COMMON TASKS

### Add a formula to the database
Go to `/dashboard`, enter your admin secret, click "Add Entry", fill in the before/after details and formula. Or use the API:
```bash
curl -X POST http://localhost:3000/api/formulas \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: YOUR_SECRET" \
  -d '{"beforeHairColor":"Level 5 warm brown","afterHairColor":"Level 8 cool blonde","beforeLevel":5,"afterLevel":8,"technique":"Balayage","formulaDetails":"Full formula text here...","colorBrand":"Redken","tags":["balayage","blonde"]}'
```

### Deploy to Vercel
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# ANTHROPIC_API_KEY, DATABASE_URL, BLOB_READ_WRITE_TOKEN, RESEND_API_KEY, ADMIN_SECRET
```

### Run Prisma Studio (visual DB browser)
```bash
npx prisma studio
```

## DESIGN SYSTEM

- **Fonts:** Cormorant Garamond (display), DM Sans (body), JetBrains Mono (mono)
- **Colors:** pearl (#FAF9F7), cream (#F5F0EB), sand (#E8DFD5), clay (#C4B5A5), stone (#8A7E72), espresso (#3D2E1F), caramel (#C8874B), honey (#E5A84B), copper (#B87333), rose (#C4736E)
- **Style:** Warm, editorial, luxury salon aesthetic. Glass nav bars, grain overlay, subtle animations.

## WHAT TO WORK ON NEXT

Priority enhancements to build:
1. **Image upload to Vercel Blob** — Currently images are sent as base64 in the API call. Add proper blob upload so images persist and can be displayed in the admin dashboard.
2. **User authentication** — Add simple email magic-link auth so stylists can save their analyses and build a history.
3. **Formula sharing** — Generate shareable links for formula results (so stylists can save/bookmark or share with assistants).
4. **CSV import for formulas** — Build a CSV upload in the admin dashboard so the owner can bulk-import formula entries.
5. **Enhanced matching algorithm** — Add color vector embeddings to FormulaEntry for more accurate similarity matching (currently uses level ranges and tags).
6. **Instagram lead gen integration** — Add UTM-tracked links for Instagram bio + story swipe-ups.
7. **Email drip campaign** — After waitlist signup, send a 3-email sequence via Resend (welcome → how it works → try the free tool).
8. **Mobile optimization** — Ensure the upload flow works perfectly on mobile (camera capture on phones).
9. **Analytics** — Add PostHog or Vercel Analytics to track funnel: landing → upload → complete analysis → waitlist signup.
10. **Rate limiting** — Add rate limiting to the /api/analyze endpoint to control API costs.

## IMPORTANT NOTES

- The `/api/analyze` endpoint has `maxDuration: 60` in vercel.json because the AI pipeline can take 15-30 seconds with multiple Claude API calls.
- The admin dashboard at `/dashboard` is protected by a simple secret key (ADMIN_SECRET env var). This is fine for a single-owner app but should be upgraded to proper auth for multi-user admin access.
- The formula database matching is the KEY VALUE of this app. The more before/after entries with detailed formulas you add, the better the AI recommendations become.
- All AI responses are parsed as JSON. The engine has fallback defaults if JSON parsing fails.
- The landing page doubles as the lead gen funnel — the waitlist form at the bottom captures emails to the Lead table and optionally sends a welcome email via Resend.

## STYLE GUIDELINES FOR CODE CHANGES

- Use TypeScript strict mode
- Follow the existing Tailwind theme (don't introduce new color variables without updating tailwind.config.js)
- Keep the warm, editorial aesthetic — no cold blues or generic tech colors
- Use Framer Motion for animations (already installed)
- All API routes should have proper error handling with try/catch
- Database operations should never block the main response — use try/catch and log errors
