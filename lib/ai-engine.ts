// ===========================================
// ColorLab AI — Hair Analysis Engine
// ===========================================
// Uses Claude Vision to analyze client + inspo photos,
// then matches against the formula database.

import Anthropic from '@anthropic-ai/sdk';
import prisma from './prisma';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// ─── IMAGE ANALYSIS ─────────────────────────────────────────

interface HairAnalysis {
  level: number;           // 1-10
  tone: string;            // "warm", "cool", "neutral"
  undertone: string;       // "gold", "orange", "red", "ash", "violet"
  condition: string;       // "virgin", "previously colored", "damaged", "healthy"
  porosity: string;        // "low", "medium", "high"
  texture: string;         // "fine", "medium", "coarse"
  pattern: string;         // "straight", "wavy", "curly", "coily"
  grayPercentage: number;  // 0-100
  currentColor: string;    // descriptive text
  highlights: boolean;
  notes: string;
}

interface InspoAnalysis {
  targetLevel: number;
  targetTone: string;
  technique: string;       // "balayage", "foilyage", "full foil", "shadow root", etc.
  placement: string;       // "face frame", "full head", "money piece", etc.
  dimensionality: string;  // "high contrast", "seamless blend", "chunky", "babylights"
  colorDescription: string;
  estimatedLiftNeeded: number; // levels of lift needed
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
  
  // Step 1: Analyze client's current hair
  const clientAnalysis = await analyzeClientHair(clientImageBase64, clientImageMediaType);
  
  // Step 2: Analyze inspiration photo
  const inspoAnalysis = await analyzeInspoHair(inspoImageBase64, inspoImageMediaType);
  
  // Step 3: Search formula database for similar transformations
  const matchedEntries = await findSimilarFormulas(clientAnalysis, inspoAnalysis);
  
  // Step 4: Generate final recommendation using all data
  const recommendation = await generateRecommendation(
    clientImageBase64,
    inspoImageBase64,
    clientImageMediaType,
    inspoImageMediaType,
    clientAnalysis,
    inspoAnalysis,
    matchedEntries
  );
  
  return {
    clientAnalysis,
    inspoAnalysis,
    recommendation,
    matchedEntries,
    confidence: matchedEntries.length > 0 ? 0.85 : 0.65,
  };
}

// ─── STEP 1: Analyze Client Hair ────────────────────────────

async function analyzeClientHair(
  imageBase64: string,
  mediaType: string
): Promise<HairAnalysis> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as any,
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: `You are an expert hair colorist analyzing a client's current hair. Analyze this photo and respond with ONLY a JSON object (no markdown, no backticks) with these exact fields:

{
  "level": <number 1-10, where 1=black, 10=lightest blonde>,
  "tone": "<warm|cool|neutral>",
  "undertone": "<gold|orange|red|ash|violet|none>",
  "condition": "<virgin|previously colored|damaged|healthy|over-processed>",
  "porosity": "<low|medium|high>",
  "texture": "<fine|medium|coarse>",
  "pattern": "<straight|wavy|curly|coily>",
  "grayPercentage": <number 0-100>,
  "currentColor": "<descriptive text of current hair color>",
  "highlights": <true|false>,
  "notes": "<any relevant observations about the hair>"
}

Be precise with the level number — this is critical for formulation. Note any banding, previous color, or damage you can see.`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  try {
    return JSON.parse(text.replace(/```json\n?|```/g, '').trim());
  } catch {
    // Fallback with defaults
    return {
      level: 5, tone: 'neutral', undertone: 'none', condition: 'previously colored',
      porosity: 'medium', texture: 'medium', pattern: 'straight', grayPercentage: 0,
      currentColor: 'Unable to determine precisely', highlights: false,
      notes: 'Photo quality may affect accuracy — recommend in-person strand test.',
    };
  }
}

// ─── STEP 2: Analyze Inspiration Photo ──────────────────────

async function analyzeInspoHair(
  imageBase64: string,
  mediaType: string
): Promise<InspoAnalysis> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as any,
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: `You are an expert hair colorist analyzing an inspiration/goal photo. Analyze this target look and respond with ONLY a JSON object (no markdown, no backticks):

{
  "targetLevel": <number 1-10>,
  "targetTone": "<warm|cool|neutral>",
  "technique": "<balayage|foilyage|full foil highlights|partial foil|shadow root|ombre|sombre|color melt|all-over color|lowlights|babylights|money piece|face frame|cap highlights|other>",
  "placement": "<face frame|full head|half head|money piece|scattered|concentrated at ends|root area|other>",
  "dimensionality": "<high contrast|seamless blend|chunky|babylights|natural dimension|ribbon highlights|other>",
  "colorDescription": "<detailed description of the target color result>",
  "estimatedLiftNeeded": <number of levels of lift this typically requires from average starting point>
}`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  try {
    return JSON.parse(text.replace(/```json\n?|```/g, '').trim());
  } catch {
    return {
      targetLevel: 8, targetTone: 'cool', technique: 'balayage',
      placement: 'full head', dimensionality: 'seamless blend',
      colorDescription: 'Unable to determine precisely',
      estimatedLiftNeeded: 3,
    };
  }
}

// ─── STEP 3: Match Against Formula Database ─────────────────

async function findSimilarFormulas(
  client: HairAnalysis,
  inspo: InspoAnalysis
): Promise<any[]> {
  // Query database for entries with similar before → after transformations
  const entries = await prisma.formulaEntry.findMany({
    where: {
      OR: [
        // Match by technique
        { technique: { contains: inspo.technique, mode: 'insensitive' } },
        // Match by similar level range
        {
          AND: [
            { beforeLevel: { gte: Math.max(1, client.level - 2) } },
            { beforeLevel: { lte: Math.min(10, client.level + 2) } },
            { afterLevel: { gte: Math.max(1, inspo.targetLevel - 2) } },
            { afterLevel: { lte: Math.min(10, inspo.targetLevel + 2) } },
          ],
        },
        // Match by tags
        { tags: { hasSome: [inspo.technique, inspo.targetTone, inspo.dimensionality] } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return entries;
}

// ─── STEP 4: Generate Final Recommendation ──────────────────

async function generateRecommendation(
  clientImageBase64: string,
  inspoImageBase64: string,
  clientMediaType: string,
  inspoMediaType: string,
  clientAnalysis: HairAnalysis,
  inspoAnalysis: InspoAnalysis,
  matchedEntries: any[]
): Promise<FormulaRecommendation> {
  
  const databaseContext = matchedEntries.length > 0
    ? `\n\nHere are similar transformations from our proven formula database:\n${matchedEntries.map((e, i) => `
Entry ${i + 1}:
- Before: ${e.beforeHairColor} (Level ${e.beforeLevel})
- After: ${e.afterHairColor} (Level ${e.afterLevel})
- Technique: ${e.technique}
- Formula: ${e.formulaDetails}
- Brand: ${e.colorBrand || 'Not specified'}
- Lightener: ${e.lightener || 'None'}
- Developer: ${e.developer || 'Not specified'}
- Toner: ${e.toner || 'None'}
- Processing Time: ${e.processingTime || 'Not specified'}
- Notes: ${e.notes || 'None'}
`).join('\n')}`
    : '\n\nNo exact matches found in our database — please provide your best professional recommendation based on the analysis.';

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: clientMediaType as any, data: clientImageBase64 },
          },
          {
            type: 'image',
            source: { type: 'base64', media_type: inspoMediaType as any, data: inspoImageBase64 },
          },
          {
            type: 'text',
            text: `You are an elite hair colorist formulator. Image 1 is the CLIENT'S CURRENT HAIR. Image 2 is the INSPIRATION/GOAL.

CLIENT HAIR ANALYSIS:
${JSON.stringify(clientAnalysis, null, 2)}

INSPIRATION ANALYSIS:
${JSON.stringify(inspoAnalysis, null, 2)}
${databaseContext}

IMPORTANT PROFESSIONAL RULES — always follow these:
- GREY HAIR DEVELOPER RULE: If the client has ANY grey/white hair (even 10-20%), use 10 vol developer for root and mid-shaft color application. Grey hair is resistant and porous — 10 vol deposits color more effectively without unnecessary lift. Only use higher vol on grey if intentionally lifting.
- Always recommend a strand test for color corrections or when lifting more than 3 levels.
- For previously colored hair, factor in existing pigment buildup when recommending formulas.
- Bond builders (Olaplex, K18, etc.) should be recommended for any lightening service.
- Processing times should account for hair porosity — high porosity processes faster.

Based on ALL of the above, provide a complete color formula and technique guide. Respond with ONLY a JSON object (no markdown, no backticks):

{
  "summary": "<2-3 sentence overview of the transformation and approach>",
  "technique": "<primary technique name>",
  "steps": ["<step 1>", "<step 2>", ...],
  "formula": {
    "lightener": "<lightener product if needed, or null>",
    "lightenerDeveloper": "<developer volume for lightener, or null>",
    "lightenerRatio": "<mix ratio, or null>",
    "colorLine": "<recommended color line/brand>",
    "rootFormula": "<root color formula if applicable, or null>",
    "midFormula": "<mid-shaft formula if applicable, or null>",
    "endFormula": "<ends formula if applicable, or null>",
    "toner": "<toner formula if needed, or null>",
    "tonerDeveloper": "<toner developer, or null>",
    "gloss": "<gloss formula if recommended, or null>",
    "additives": ["<bond builder, etc>"],
    "processingTimes": {
      "lightener": "<time or null>",
      "color": "<time or null>",
      "toner": "<time or null>"
    }
  },
  "warnings": ["<important warnings or precautions>"],
  "tips": ["<professional tips for best results>"],
  "difficulty": "<beginner|intermediate|advanced>",
  "estimatedTime": "<total chair time estimate>",
  "estimatedPrice": "<$|$$|$$$|$$$$>"
}

Be specific with product names, shade numbers, ratios, and timing. This will be used by professional stylists.`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  try {
    return JSON.parse(text.replace(/```json\n?|```/g, '').trim());
  } catch {
    return {
      summary: 'Analysis complete — see details below.',
      technique: inspoAnalysis.technique,
      steps: ['Consult with client', 'Perform strand test', 'Proceed with color service'],
      formula: {
        colorLine: 'Consult formula database',
        processingTimes: {},
        additives: ['Bond builder recommended'],
      },
      warnings: ['Always perform a strand test before full application', 'Photo analysis has limitations — adjust in person'],
      tips: ['Verify levels in person under natural light'],
      difficulty: 'intermediate',
      estimatedTime: '2-4 hours',
      estimatedPrice: '$$$',
    };
  }
}

export type { HairAnalysis, InspoAnalysis, FormulaRecommendation };
