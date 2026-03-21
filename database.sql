-- ═══════════════════════════════════════════════════════════════
-- ColorLab AI — Database Schema (Raw SQL)
-- ═══════════════════════════════════════════════════════════════
-- Use this file if you want to set up the database manually
-- without Prisma migrations. Run against any PostgreSQL 14+ instance.
--
-- Usage:
--   psql -U your_user -d colorlab -f database.sql
--
-- Or in a GUI like pgAdmin / TablePlus / Supabase SQL Editor:
--   1. Create database: CREATE DATABASE colorlab;
--   2. Connect to it
--   3. Paste and run this entire file
-- ═══════════════════════════════════════════════════════════════

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── FORMULA DATABASE (populated by admin) ──────────────────

CREATE TABLE IF NOT EXISTS "FormulaEntry" (
    "id"              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Before photo metadata
    "beforeImageUrl"  TEXT NOT NULL,
    "beforeHairColor" TEXT NOT NULL,
    "beforeHairType"  TEXT,
    "beforeCondition" TEXT,
    "beforeLevel"     INTEGER,

    -- After photo metadata
    "afterImageUrl"   TEXT NOT NULL,
    "afterHairColor"  TEXT NOT NULL,
    "afterLevel"      INTEGER,

    -- Color formula
    "technique"       TEXT NOT NULL,
    "formulaDetails"  TEXT NOT NULL,

    -- Structured formula fields
    "colorBrand"      TEXT,
    "colorLine"       TEXT,
    "colorShades"     TEXT[] DEFAULT '{}',
    "developer"       TEXT,
    "developerRatio"  TEXT,
    "lightener"       TEXT,
    "lightenerMix"    TEXT,
    "toner"           TEXT,
    "tonerDeveloper"  TEXT,
    "additives"       TEXT[] DEFAULT '{}',
    "processingTime"  TEXT,

    -- Categorization
    "tags"            TEXT[] DEFAULT '{}',
    "difficulty"      TEXT,
    "priceRange"      TEXT,
    "estimatedTime"   TEXT,

    -- Matching metadata
    "colorVector"     TEXT,
    "notes"           TEXT
);

CREATE INDEX "FormulaEntry_tags_idx" ON "FormulaEntry" USING GIN ("tags");
CREATE INDEX "FormulaEntry_technique_idx" ON "FormulaEntry" ("technique");
CREATE INDEX "FormulaEntry_beforeLevel_idx" ON "FormulaEntry" ("beforeLevel");
CREATE INDEX "FormulaEntry_afterLevel_idx" ON "FormulaEntry" ("afterLevel");

-- ─── USER SUBMISSIONS ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Stylist" (
    "id"              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    "email"           TEXT NOT NULL,
    "name"            TEXT NOT NULL,
    "salon"           TEXT,
    "city"            TEXT,
    "state"           TEXT,
    "phone"           TEXT,
    "instagram"       TEXT,
    "specialties"     TEXT[] DEFAULT '{}',

    "analysisCount"   INTEGER NOT NULL DEFAULT 0,

    "source"          TEXT,
    "referralCode"    TEXT,
    "referredBy"      TEXT,

    CONSTRAINT "Stylist_email_key" UNIQUE ("email"),
    CONSTRAINT "Stylist_referralCode_key" UNIQUE ("referralCode")
);

CREATE INDEX "Stylist_email_idx" ON "Stylist" ("email");

CREATE TABLE IF NOT EXISTS "Submission" (
    "id"              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    "clientImageUrl"  TEXT NOT NULL,
    "inspoImageUrl"   TEXT NOT NULL,

    "clientHairInfo"  JSONB,
    "inspoHairInfo"   JSONB,

    "stylistId"       TEXT,

    CONSTRAINT "Submission_stylistId_fkey"
        FOREIGN KEY ("stylistId") REFERENCES "Stylist"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "Submission_stylistId_idx" ON "Submission" ("stylistId");

CREATE TABLE IF NOT EXISTS "Analysis" (
    "id"              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    "submissionId"    TEXT NOT NULL,
    "summary"         TEXT NOT NULL,
    "recommendedFormula" TEXT NOT NULL,
    "technique"       TEXT NOT NULL,
    "estimatedTime"   TEXT,
    "difficulty"      TEXT,
    "warnings"        TEXT[] DEFAULT '{}',
    "tips"            TEXT[] DEFAULT '{}',

    "matchedEntryId"  TEXT,
    "matchConfidence" DOUBLE PRECISION,

    "rawAiResponse"   JSONB,

    CONSTRAINT "Analysis_submissionId_key" UNIQUE ("submissionId"),
    CONSTRAINT "Analysis_submissionId_fkey"
        FOREIGN KEY ("submissionId") REFERENCES "Submission"("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Analysis_matchedEntryId_fkey"
        FOREIGN KEY ("matchedEntryId") REFERENCES "FormulaEntry"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "Analysis_matchedEntryId_idx" ON "Analysis" ("matchedEntryId");

-- ─── LEAD GEN & WAITLIST ────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Lead" (
    "id"              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    "email"           TEXT NOT NULL,
    "name"            TEXT,
    "salon"           TEXT,
    "city"            TEXT,
    "phone"           TEXT,
    "instagram"       TEXT,

    "source"          TEXT,
    "utmSource"       TEXT,
    "utmMedium"       TEXT,
    "utmCampaign"     TEXT,

    "emailsSent"      INTEGER NOT NULL DEFAULT 0,
    "lastEmailAt"     TIMESTAMP(3),
    "converted"       BOOLEAN NOT NULL DEFAULT false,
    "convertedAt"     TIMESTAMP(3),

    CONSTRAINT "Lead_email_key" UNIQUE ("email")
);

CREATE INDEX "Lead_email_idx" ON "Lead" ("email");
CREATE INDEX "Lead_source_idx" ON "Lead" ("source");

-- ─── SAMPLE DATA (3 starter formulas) ───────────────────────

INSERT INTO "FormulaEntry" (
    "beforeImageUrl", "beforeHairColor", "beforeHairType", "beforeCondition", "beforeLevel",
    "afterImageUrl", "afterHairColor", "afterLevel",
    "technique", "formulaDetails",
    "colorBrand", "colorLine", "colorShades", "developer", "developerRatio",
    "lightener", "lightenerMix", "toner", "tonerDeveloper",
    "additives", "processingTime", "tags", "difficulty", "priceRange", "estimatedTime", "notes"
) VALUES
(
    '/images/samples/before-1.jpg',
    'Level 4 warm brown with orange undertones',
    '2A wavy, medium porosity',
    'Previously colored, box dye history',
    4,
    '/images/samples/after-1.jpg',
    'Level 8 cool-toned beige blonde balayage',
    8,
    'Balayage with foil boosting',
    'Lightener: Redken Flash Lift + 30 vol (1:2 ratio). Paint balayage freehand on mid-lengths to ends. Foil boost face frame pieces. Process 45 minutes checking every 10. Rinse when lifted to pale yellow (level 9-10 inside foils). Toner: Shades EQ 9V + 9P equal parts with processing solution. Process 20 minutes. Finish with Acidic Bonding Concentrate conditioner.',
    'Redken', 'Shades EQ', ARRAY['9V', '9P'], '30 vol', '1:2',
    'Flash Lift', '30 vol, 1:2 ratio', 'Shades EQ 9V + 9P equal parts', 'Processing solution',
    ARRAY['Olaplex No.1'], '45 min lightener, 20 min toner',
    ARRAY['balayage', 'blonde', 'cool-tone', 'redken', 'beige'],
    'intermediate', '$$$', '3-4 hours',
    'Client had box dye history — did a strand test first. Needed foil boosting for adequate lift through resistant mid-shaft.'
),
(
    '/images/samples/before-2.jpg',
    'Level 6 neutral brown, virgin hair',
    '1C straight, low porosity',
    'Virgin hair, healthy',
    6,
    '/images/samples/after-2.jpg',
    'Level 7 warm copper auburn all-over',
    7,
    'All-over color with gloss finish',
    'Color: Wella Koleston Perfect 7/43 + 7/34 (equal parts) with 20 vol developer (1:1 ratio). Apply root to ends on dry hair. Process 35 minutes. Rinse. Gloss: Shinefinity 08/34 with activator. Process 20 minutes. Finish with Color Motion mask.',
    'Wella', 'Koleston Perfect', ARRAY['7/43', '7/34'], '20 vol', '1:1',
    NULL, NULL, NULL, NULL,
    ARRAY['Wellaplex No.1'], '35 min color, 20 min gloss',
    ARRAY['auburn', 'copper', 'warm', 'all-over', 'wella', 'virgin-hair'],
    'beginner', '$$', '1.5-2 hours',
    'Virgin hair lifts easily. Low porosity — apply to dry hair for better penetration.'
),
(
    '/images/samples/before-3.jpg',
    'Level 2 black with prior permanent color',
    '3A curly, high porosity',
    'Previously colored, slight damage at ends',
    2,
    '/images/samples/after-3.jpg',
    'Level 5 rich chocolate with caramel money pieces',
    5,
    'Money piece highlights with all-over gloss',
    'Money pieces: Schwarzkopf BlondMe Bond Enforcing Premium Lift 9+ with 20 vol (1:1.5). Foil face-framing pieces (4-5 foils per side). Process 35 min. All-over gloss: Schwarzkopf IGORA Vibrance 5-65 + 5-57 (2:1 ratio) with activator lotion. Process 20 min. Bond treatment: Fibreplex No.2 post-service.',
    'Schwarzkopf', 'IGORA Vibrance', ARRAY['5-65', '5-57'], '20 vol', '1:1.5',
    'BlondMe Premium Lift 9+', '20 vol, 1:1.5 ratio', NULL, NULL,
    ARRAY['Fibreplex No.1', 'Fibreplex No.2'], '35 min lightener, 20 min gloss',
    ARRAY['money-piece', 'face-frame', 'chocolate', 'caramel', 'schwarzkopf', 'curly'],
    'intermediate', '$$$', '2.5-3 hours',
    'High porosity curly hair — use lower volume developer for controlled lift. Avoid overlapping on previously lightened areas.'
);

-- ─── VERIFY ─────────────────────────────────────────────────

SELECT 'Database setup complete!' AS status;
SELECT COUNT(*) AS formula_count FROM "FormulaEntry";
SELECT COUNT(*) AS lead_count FROM "Lead";
SELECT COUNT(*) AS stylist_count FROM "Stylist";
