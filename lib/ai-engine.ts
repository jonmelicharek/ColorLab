// ===========================================
// ColorLab AI — Hair Analysis Engine
// ===========================================
// Uses Claude Vision to analyze client + inspo photos,
// then matches against the formula database.
// OPTIMIZED: Single API call for speed on Vercel hobby plan.

import Anthropic from '@anthropic-ai/sdk';
import prisma from './prisma';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// ─── INTERFACES ───────────────────────────────────────────

interface HairAnalysis {
  level: number;
  tone: string;
  undertone: string;
  condition: string;
  porosity: string;
  texture: string;
  pattern: string;
  grayPercentage: number;
  currentColor: string;
  highlights: boolean;
  notes: string;
}

interface InspoAnalysis {
  targetLevel: number;
  targetTone: string;
  technique: string;
  placement: string;
  dimensionality: string;
  colorDescription: string;
  estimatedLiftNeeded: number;
}

interface FormulaRecommendation {
  summary: string;
  technique: string;
  steps: string[];
  formula: {
    lightener?: string;
    lightenerDeveloper?: string;
    lightenerRatio?: string;
    colorLine?: string;
    rootFormula?: string;
    midFormula?: string;
    endFormula?: string;
    toner?: string;
    tonerDeveloper?: string;
    gloss?: string;
    additives?: string[];
    processingTimes: Record<string, string>;
  };
  warnings: string[];
  tips: string[];
  difficulty: string;
  estimatedTime: string;
  estimatedPrice: string;
}

interface FullAnalysisResponse {
  clientAnalysis: HairAnalysis;
  inspoAnalysis: InspoAnalysis;
  recommendation: FormulaRecommendation;
}

// ─── MAIN ANALYSIS (SINGLE API CALL) ─────────────────────

export async function analyzePhotos(
  clientImageBase64: string,
  inspoImageBase64: string,
  clientImageMediaType: string = 'image/jpeg',
  inspoImageMediaType: string = 'image/jpeg'
): Promise<{
  clientAnalysis: HairAnalysis;
  inspoAnalysis: InspoAnalysis;
  recommendation: FormulaRecommendation;
  matchedEntries: any[];
  confidence: number;
}> {

  // Step 1: Pre-fetch formula database entries (runs while we build the prompt)
  const allEntries = await prisma.formulaEntry.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
  });

  // Build database context string
  const databaseContext = allEntries.length > 0
    ? `\n\nHere are proven formulas from our database — use these as reference when building the recommendation:\n${allEntries.slice(0, 8).map((e, i) => `
Entry ${i + 1}: Before: ${e.beforeHairColor} (Level ${e.beforeLevel}) -> After: ${e.afterHairColor} (Level ${e.afterLevel})
  Technique: ${e.technique} | Brand: ${e.colorBrand || 'N/A'} | Formula: ${e.formulaDetails}
  Developer: ${e.developer || 'N/A'} | Lightener: ${e.lightener || 'None'} | Toner: ${e.toner || 'None'}
  Processing: ${e.processingTime || 'N/A'} | Notes: ${e.notes || 'None'}`).join('\n')}`
    : '';

  // Step 2: Single comprehensive API call with both images
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: clientImageMediaType as any, data: clientImageBase64 },
          },
          {
            type: 'image',
            source: { type: 'base64', media_type: inspoImageMediaType as any, data: inspoImageBase64 },
          },
          {
            type: 'text',
            text: `You are an elite professional hair colorist. Image 1 is the CLIENT'S CURRENT HAIR. Image 2 is the INSPIRATION/GOAL they want to achieve.

Analyze both photos and provide a complete formula recommendation. Respond with ONLY a JSON object (no markdown, no backticks, no explanation outside the JSON):

{
  "clientAnalysis": {
    "level": <number 1-10, 1=black 10=lightest blonde>,
    "tone": "<warm|cool|neutral>",
    "undertone": "<gold|orange|red|ash|violet|none>",
    "condition": "<virgin|previously colored|damaged|healthy|over-processed>",
    "porosity": "<low|medium|high>",
    "texture": "<fine|medium|coarse>",
    "pattern": "<straight|wavy|curly|coily>",
    "grayPercentage": <number 0-100>,
    "currentColor": "<descriptive text>",
    "highlights": <true|false>,
    "notes": "<observations about current hair>"
  },
  "inspoAnalysis": {
    "targetLevel": <number 1-10>,
    "targetTone": "<warm|cool|neutral>",
    "technique": "<balayage|foilyage|full foil highlights|partial foil|shadow root|ombre|sombre|color melt|all-over color|lowlights|babylights|money piece|face frame|other>",
    "placement": "<face frame|full head|half head|money piece|scattered|concentrated at ends|root area|other>",
    "dimensionality": "<high contrast|seamless blend|chunky|babylights|natural dimension|ribbon highlights|other>",
    "colorDescription": "<detailed description of target color>",
    "estimatedLiftNeeded": <number of levels>
  },
  "recommendation": {
    "summary": "<2-3 sentence overview>",
    "technique": "<primary technique>",
    "steps": ["<step 1>", "<step 2>", "..."],
    "formula": {
      "lightener": "<product or null>",
      "lightenerDeveloper": "<volume or null>",
      "lightenerRatio": "<ratio or null>",
      "colorLine": "<brand/line>",
      "rootFormula": "<formula or null>",
      "midFormula": "<formula or null>",
      "endFormula": "<formula or null>",
      "toner": "<formula or null>",
      "tonerDeveloper": "<developer or null>",
      "gloss": "<formula or null>",
      "additives": ["<bond builder, etc>"],
      "processingTimes": {
        "lightener": "<time or null>",
        "color": "<time or null>",
        "toner": "<time or null>"
      }
    },
    "warnings": ["<warnings>"],
    "tips": ["<pro tips>"],
    "difficulty": "<beginner|intermediate|advanced>",
    "estimatedTime": "<chair time>",
    "estimatedPrice": "<$|$$|$$$|$$$$>"
  }
}

CRITICAL PROFESSIONAL RULES — you MUST follow these:
- ABSOLUTE RULE — ENDS NEVER DARKER THAN ROOT: The endFormula must NEVER be a darker level than the rootFormula. In NO circumstance should the ends be formulated darker than the root. This applies to ALL services — lightening, darkening, toning, everything. Roots are always the darkest point; mid-lengths are equal or lighter; ends are equal or lighter than mid-lengths. Formula levels must follow: rootFormula level <= midFormula level <= endFormula level. If a zone doesn't need color, use null — do NOT apply a darker shade to it.
- GREY HAIR DEVELOPER RULE: If the client has ANY grey/white hair (even 10-20%), use 10 vol developer for root and mid-shaft color application. Grey hair is resistant and porous — 10 vol deposits color more effectively without unnecessary lift. Only use higher vol on grey if intentionally lifting.
- Always recommend a strand test for color corrections or when lifting more than 3 levels.
- For previously colored hair, factor in existing pigment buildup.
- Bond builders (Olaplex, K18, etc.) should be recommended for any lightening service.
- Processing times should account for hair porosity — high porosity processes faster.
- Be specific with product names, shade numbers, ratios, and timing.
- The rootFormula, midFormula, and endFormula should reflect what is being applied to each zone. If a zone is left untouched, say "Leave natural" or null — do NOT apply a darker formula to that zone unless darkening is the intent.
${databaseContext}`
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  let parsed: FullAnalysisResponse;
  try {
    parsed = JSON.parse(text.replace(/```json\n?|```/g, '').trim());
  } catch {
    // Fallback if JSON parsing fails
    parsed = getDefaultResponse();
  }

  // Step 3: Find matching formulas based on the analysis
  const matchedEntries = await findSimilarFormulas(parsed.clientAnalysis, parsed.inspoAnalysis);

  return {
    clientAnalysis: parsed.clientAnalysis,
    inspoAnalysis: parsed.inspoAnalysis,
    recommendation: parsed.recommendation,
    matchedEntries,
    confidence: matchedEntries.length > 0 ? 0.85 : 0.65,
  };
}

// ─── FORMULA DATABASE MATCHING ────────────────────────────

async function findSimilarFormulas(
  client: HairAnalysis,
  inspo: InspoAnalysis
): Promise<any[]> {
  try {
    const entries = await prisma.formulaEntry.findMany({
      where: {
        OR: [
          { technique: { contains: inspo.technique, mode: 'insensitive' } },
          {
            AND: [
              { beforeLevel: { gte: Math.max(1, client.level - 2) } },
              { beforeLevel: { lte: Math.min(10, client.level + 2) } },
              { afterLevel: { gte: Math.max(1, inspo.targetLevel - 2) } },
              { afterLevel: { lte: Math.min(10, inspo.targetLevel + 2) } },
            ],
          },
          { tags: { hasSome: [inspo.technique, inspo.targetTone, inspo.dimensionality].filter(Boolean) } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    return entries;
  } catch {
    return [];
  }
}

// ─── FALLBACK DEFAULT ─────────────────────────────────────

function getDefaultResponse(): FullAnalysisResponse {
  return {
    clientAnalysis: {
      level: 5, tone: 'neutral', undertone: 'none', condition: 'previously colored',
      porosity: 'medium', texture: 'medium', pattern: 'straight', grayPercentage: 0,
      currentColor: 'Unable to determine precisely from photo', highlights: false,
      notes: 'Photo quality may affect accuracy — recommend in-person strand test.',
    },
    inspoAnalysis: {
      targetLevel: 8, targetTone: 'cool', technique: 'balayage',
      placement: 'full head', dimensionality: 'seamless blend',
      colorDescription: 'Unable to determine precisely from photo',
      estimatedLiftNeeded: 3,
    },
    recommendation: {
      summary: 'Analysis complete but could not generate detailed formula from photos. Please consult with the client in person for accurate formulation.',
      technique: 'Consult required',
      steps: ['Perform in-person consultation', 'Conduct strand test', 'Develop formula based on in-person assessment'],
      formula: {
        colorLine: 'To be determined in consultation',
        processingTimes: {},
        additives: ['Bond builder recommended'],
      },
      warnings: ['Always perform a strand test before full application', 'Photo analysis has limitations — verify in person'],
      tips: ['Check levels under natural light', 'Assess porosity with water test'],
      difficulty: 'intermediate',
      estimatedTime: '2-4 hours',
      estimatedPrice: '$$$',
    },
  };
}

export type { HairAnalysis, InspoAnalysis, FormulaRecommendation };
