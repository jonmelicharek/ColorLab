import { z } from 'zod';

// ─── Analyze Endpoint ───────────────────────────────────────

export const analyzeSchema = z.object({
  clientImage: z
    .string()
    .min(100, 'Client image data is too small — upload a valid image')
    .describe('Base64-encoded client photo'),
  clientMediaType: z
    .string()
    .regex(/^image\/(jpeg|png|webp|gif|heic)$/, 'Unsupported image format')
    .default('image/jpeg'),
  inspoImage: z
    .string()
    .min(100, 'Inspiration image data is too small — upload a valid image')
    .describe('Base64-encoded inspiration photo'),
  inspoMediaType: z
    .string()
    .regex(/^image\/(jpeg|png|webp|gif|heic)$/, 'Unsupported image format')
    .default('image/jpeg'),
});

export type AnalyzeInput = z.infer<typeof analyzeSchema>;

// ─── Lead Capture ───────────────────────────────────────────

export const leadSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .transform((v) => v.toLowerCase().trim()),
  name: z.string().max(100).optional(),
  salon: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  instagram: z
    .string()
    .max(50)
    .optional()
    .transform((v) => v?.replace(/^@/, '')),
  source: z.string().max(50).optional().default('waitlist'),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(200).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

// ─── Formula Entry ──────────────────────────────────────────

export const formulaEntrySchema = z.object({
  id: z.string().optional(),
  beforeImageUrl: z.string().url().or(z.string().startsWith('/')),
  beforeHairColor: z.string().min(1, 'Before hair color is required').max(500),
  beforeHairType: z.string().max(200).optional().nullable(),
  beforeCondition: z.string().max(200).optional().nullable(),
  beforeLevel: z.coerce.number().min(1).max(10).optional().nullable(),
  afterImageUrl: z.string().url().or(z.string().startsWith('/')),
  afterHairColor: z.string().min(1, 'After hair color is required').max(500),
  afterLevel: z.coerce.number().min(1).max(10).optional().nullable(),
  technique: z.string().min(1, 'Technique is required').max(200),
  formulaDetails: z.string().min(1, 'Formula details are required').max(5000),
  colorBrand: z.string().max(100).optional().nullable(),
  colorLine: z.string().max(100).optional().nullable(),
  colorShades: z.array(z.string()).optional().default([]),
  developer: z.string().max(100).optional().nullable(),
  developerRatio: z.string().max(50).optional().nullable(),
  lightener: z.string().max(200).optional().nullable(),
  lightenerMix: z.string().max(200).optional().nullable(),
  toner: z.string().max(500).optional().nullable(),
  tonerDeveloper: z.string().max(200).optional().nullable(),
  additives: z.array(z.string()).optional().default([]),
  processingTime: z.string().max(200).optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional().nullable(),
  priceRange: z.enum(['$', '$$', '$$$', '$$$$']).optional().nullable(),
  estimatedTime: z.string().max(100).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export type FormulaEntryInput = z.infer<typeof formulaEntrySchema>;
