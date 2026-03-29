// ===========================================
// ColorLab AI — Social Media Content Generator
// ===========================================
// Uses Claude to generate engaging Instagram posts
// tailored for hair stylists and salon marketing.

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export type PostType =
  | 'tip'           // Quick hair color tip
  | 'trend'         // Trending color/technique
  | 'education'     // Educational deep-dive
  | 'promotion'     // ColorLab feature highlight
  | 'engagement'    // Question/poll/CTA
  | 'transformation' // Before/after showcase
  | 'behind-scenes'; // Behind the chair content

interface GeneratedPost {
  caption: string;
  hashtags: string[];
  imagePrompt: string; // Description for image generation or stock photo search
  postType: PostType;
  bestTimeToPost: string;
  hook: string; // First line that shows in feed
}

// Rotating content calendar — each day of week has preferred content types
const CONTENT_CALENDAR: Record<number, PostType[]> = {
  0: ['engagement', 'behind-scenes'],   // Sunday — casual, community
  1: ['tip', 'education'],              // Monday — fresh week, learning
  2: ['trend', 'transformation'],       // Tuesday — transformation Tuesday
  3: ['education', 'tip'],              // Wednesday — mid-week value
  4: ['promotion', 'transformation'],   // Thursday — showcase
  5: ['trend', 'engagement'],           // Friday — fun, trending
  6: ['behind-scenes', 'promotion'],    // Saturday — behind the chair
};

export async function generatePost(
  overrideType?: PostType,
  context?: string
): Promise<GeneratedPost> {
  const dayOfWeek = new Date().getDay();
  const suggestedTypes = CONTENT_CALENDAR[dayOfWeek] || ['tip'];
  const postType = overrideType || suggestedTypes[Math.floor(Math.random() * suggestedTypes.length)];

  const prompt = `You are the social media manager for ColorLab AI — an app that helps hair stylists create precise color formulas using AI photo analysis. Your audience is professional hair colorists and stylists.

Generate an Instagram post of type: "${postType}"

${context ? `Additional context: ${context}` : ''}

Brand voice:
- Professional but approachable — like a fellow stylist who knows their stuff
- Confident, not salesy — educate first, promote second
- Use hair color industry terminology naturally (levels, tones, undertones, formulations)
- Empowering — help stylists feel like experts
- Modern and trend-aware

Rules:
- Caption should be 100-200 words (Instagram sweet spot)
- Start with a HOOK — the first line must stop the scroll (this shows in the feed preview)
- Use line breaks for readability (Instagram doesn't render markdown)
- Include a clear CTA (call to action) at the end
- Reference ColorLab AI naturally when relevant (not forced)
- For "tip" posts: share a genuinely useful color formulation tip
- For "trend" posts: discuss current hair color trends (2025-2026)
- For "education" posts: teach something about color theory, porosity, levels, etc.
- For "promotion" posts: highlight a ColorLab feature with a benefit-first approach
- For "engagement" posts: ask a question or create a "this or that" scenario
- For "transformation" posts: describe a dramatic before/after scenario
- For "behind-scenes" posts: share relatable stylist moments

Return JSON only:
{
  "caption": "the full caption text with line breaks as \\n",
  "hashtags": ["array", "of", "15-20", "relevant", "hashtags", "without", "the", "hash", "symbol"],
  "imagePrompt": "detailed description of what the accompanying image should show — photorealistic, salon-quality aesthetic",
  "postType": "${postType}",
  "bestTimeToPost": "suggested time like 9:00 AM EST or 6:00 PM EST",
  "hook": "just the first line of the caption"
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response for social post');
  }

  const parsed = JSON.parse(jsonMatch[0]) as GeneratedPost;

  // Ensure hashtags don't have # prefix (we add it in formatting)
  parsed.hashtags = parsed.hashtags.map(h => h.replace(/^#/, ''));

  return parsed;
}

// Format caption with hashtags for Instagram
export function formatCaption(post: GeneratedPost): string {
  const hashtagString = post.hashtags.map(h => `#${h}`).join(' ');
  return `${post.caption}\n\n·\n\n${hashtagString}`;
}

// Generate a week's worth of content at once
export async function generateWeeklyContent(context?: string): Promise<GeneratedPost[]> {
  const posts: GeneratedPost[] = [];

  for (let day = 0; day < 7; day++) {
    const types = CONTENT_CALENDAR[day] || ['tip'];
    const postType = types[0]; // Use primary type for planned content
    const post = await generatePost(postType, context);
    posts.push(post);
  }

  return posts;
}
