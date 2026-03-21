// ═══════════════════════════════════════════════════════════════
// ColorLab AI — Shared Type Definitions
// ═══════════════════════════════════════════════════════════════

// ─── Hair Analysis Types ────────────────────────────────────

export interface HairAnalysis {
  level: number;
  tone: 'warm' | 'cool' | 'neutral';
  undertone: 'gold' | 'orange' | 'red' | 'ash' | 'violet' | 'none';
  condition: 'virgin' | 'previously colored' | 'damaged' | 'healthy' | 'over-processed';
  porosity: 'low' | 'medium' | 'high';
  texture: 'fine' | 'medium' | 'coarse';
  pattern: 'straight' | 'wavy' | 'curly' | 'coily';
  grayPercentage: number;
  currentColor: string;
  highlights: boolean;
  notes: string;
}

export interface InspoAnalysis {
  targetLevel: number;
  targetTone: 'warm' | 'cool' | 'neutral';
  technique: string;
  placement: string;
  dimensionality: string;
  colorDescription: string;
  estimatedLiftNeeded: number;
}

// ─── Formula Types ──────────────────────────────────────────

export interface FormulaDetails {
  lightener?: string | null;
  lightenerDeveloper?: string | null;
  lightenerRatio?: string | null;
  colorLine?: string | null;
  rootFormula?: string | null;
  midFormula?: string | null;
  endFormula?: string | null;
  toner?: string | null;
  tonerDeveloper?: string | null;
  gloss?: string | null;
  additives?: string[];
  processingTimes: Record<string, string>;
}

export interface FormulaRecommendation {
  summary: string;
  technique: string;
  steps: string[];
  formula: FormulaDetails;
  warnings: string[];
  tips: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  estimatedPrice: string;
}

// ─── Analysis Result ────────────────────────────────────────

export interface AnalysisResult {
  clientAnalysis: HairAnalysis;
  inspoAnalysis: InspoAnalysis;
  recommendation: FormulaRecommendation;
  matchedEntries: FormulaEntryMatch[];
  confidence: number;
}

export interface FormulaEntryMatch {
  id: string;
  beforeHairColor: string;
  afterHairColor: string;
  beforeLevel: number | null;
  afterLevel: number | null;
  technique: string;
  formulaDetails: string;
  colorBrand: string | null;
  tags: string[];
}

// ─── API Request/Response Types ─────────────────────────────

export interface AnalyzeRequest {
  clientImage: string;         // base64
  clientMediaType: string;     // MIME type
  inspoImage: string;          // base64
  inspoMediaType: string;      // MIME type
}

export interface LeadRequest {
  email: string;
  name?: string;
  salon?: string;
  city?: string;
  phone?: string;
  instagram?: string;
  source?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface FormulaEntryRequest {
  id?: string;                 // For updates
  beforeImageUrl: string;
  beforeHairColor: string;
  beforeHairType?: string;
  beforeCondition?: string;
  beforeLevel?: number;
  afterImageUrl: string;
  afterHairColor: string;
  afterLevel?: number;
  technique: string;
  formulaDetails: string;
  colorBrand?: string;
  colorLine?: string;
  colorShades?: string[];
  developer?: string;
  developerRatio?: string;
  lightener?: string;
  lightenerMix?: string;
  toner?: string;
  tonerDeveloper?: string;
  additives?: string[];
  processingTime?: string;
  tags?: string[];
  difficulty?: string;
  priceRange?: string;
  estimatedTime?: string;
  notes?: string;
}

// ─── API Response Types ─────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

export interface ApiError {
  error: string;
  code?: string;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;
