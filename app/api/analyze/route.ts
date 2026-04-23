import { NextRequest, NextResponse } from 'next/server';
import { analyzePhotos } from '@/lib/ai-engine';
import prisma from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { randomBytes } from 'crypto';

export const maxDuration = 60; // Allow up to 60s for AI processing

const FREE_LIMIT = 3;

// Get or create anonymous usage record, returns { usage, deviceId, isNew }
async function getAnonymousUsage(ip: string, deviceId: string | null) {
  // If we have a device cookie, look it up
  if (deviceId) {
    const existing = await prisma.anonymousUsage.findUnique({
      where: { deviceId },
    });
    if (existing) {
      // Monthly reset check
      const now = new Date();
      if (!existing.monthlyResetAt || now > existing.monthlyResetAt) {
        const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const updated = await prisma.anonymousUsage.update({
          where: { deviceId },
          data: { analysesUsed: 0, monthlyResetAt: nextReset },
        });
        return { usage: updated, deviceId, isNew: false };
      }
      return { usage: existing, deviceId, isNew: false };
    }
  }

  // Check if this IP already has a record (no cookie match — maybe cleared cookies)
  const byIp = await prisma.anonymousUsage.findFirst({
    where: { ipAddress: ip },
    orderBy: { createdAt: 'desc' },
  });

  if (byIp) {
    // Monthly reset check
    const now = new Date();
    if (!byIp.monthlyResetAt || now > byIp.monthlyResetAt) {
      const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const updated = await prisma.anonymousUsage.update({
        where: { id: byIp.id },
        data: { analysesUsed: 0, monthlyResetAt: nextReset },
      });
      return { usage: updated, deviceId: byIp.deviceId, isNew: false };
    }
    return { usage: byIp, deviceId: byIp.deviceId, isNew: false };
  }

  // Create new record
  const newDeviceId = randomBytes(24).toString('hex');
  const nextReset = new Date();
  nextReset.setMonth(nextReset.getMonth() + 1, 1);
  nextReset.setHours(0, 0, 0, 0);

  const usage = await prisma.anonymousUsage.create({
    data: {
      ipAddress: ip,
      deviceId: newDeviceId,
      analysesUsed: 0,
      monthlyResetAt: nextReset,
    },
  });

  return { usage, deviceId: newDeviceId, isNew: true };
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP: 20 analyses per hour
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const ipLimit = rateLimit(`analyze-ip:${ip}`, 20, 60 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before running more analyses.' },
        { status: 429 }
      );
    }

    // ─── Check usage limits server-side ───────────────────────
    const sessionToken = req.cookies.get('session_token')?.value;
    let stylist: any = null;
    let limit = FREE_LIMIT;
    let used = 0;
    let anonymousDeviceId: string | null = null;
    let anonymousUsageId: string | null = null;

    if (sessionToken) {
      // Logged-in user
      stylist = await prisma.stylist.findUnique({ where: { sessionToken } });
      if (stylist) {
        // Monthly reset check
        const now = new Date();
        if (!stylist.monthlyResetAt || now > stylist.monthlyResetAt) {
          const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          stylist = await prisma.stylist.update({
            where: { id: stylist.id },
            data: { freeAnalysesUsed: 0, monthlyResetAt: nextReset },
          });
        }

        used = stylist.freeAnalysesUsed;
        if (stylist.plan === 'salon' || stylist.plan === 'enterprise') {
          limit = -1; // unlimited
        } else if (stylist.plan === 'stylist') {
          limit = 50;
        }
      }
    }

    if (!stylist) {
      // Anonymous user — server-side tracking
      const cookieDeviceId = req.cookies.get('colorlab_device')?.value || null;
      const { usage, deviceId, isNew } = await getAnonymousUsage(ip, cookieDeviceId);
      used = usage.analysesUsed;
      anonymousDeviceId = deviceId;
      anonymousUsageId = usage.id;
    }

    // Enforce limit
    if (limit !== -1 && used >= limit) {
      const res = NextResponse.json(
        { error: 'FREE_LIMIT_REACHED', message: 'You\'ve used all your free analyses this month. Sign up for a plan to continue!' },
        { status: 403 }
      );
      // Set device cookie if needed
      if (anonymousDeviceId) {
        res.cookies.set('colorlab_device', anonymousDeviceId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 365, // 1 year
          path: '/',
        });
      }
      return res;
    }

    const body = await req.json();
    const { clientImage, clientMediaType, inspoImage, inspoMediaType } = body;

    if (!clientImage || !inspoImage) {
      return NextResponse.json(
        { error: 'Both client and inspiration images are required.' },
        { status: 400 }
      );
    }

    // Run the full AI analysis pipeline
    const result = await analyzePhotos(
      clientImage,
      inspoImage,
      clientMediaType || 'image/jpeg',
      inspoMediaType || 'image/jpeg'
    );

    // ─── Increment usage server-side ──────────────────────────
    if (stylist) {
      await prisma.stylist.update({
        where: { id: stylist.id },
        data: {
          freeAnalysesUsed: { increment: 1 },
          analysisCount: { increment: 1 },
        },
      });
    } else if (anonymousUsageId) {
      await prisma.anonymousUsage.update({
        where: { id: anonymousUsageId },
        data: { analysesUsed: { increment: 1 } },
      });
    }

    // Save submission to database and capture analysis ID for feedback
    let analysisId: string | null = null;
    try {
      const submission = await prisma.submission.create({
        data: {
          clientImageUrl: `data:${clientMediaType};base64,${clientImage.slice(0, 100)}...`,
          inspoImageUrl: `data:${inspoMediaType};base64,${inspoImage.slice(0, 100)}...`,
          clientHairInfo: result.clientAnalysis as any,
          inspoHairInfo: result.inspoAnalysis as any,
          stylistId: stylist?.id || null,
          analysis: {
            create: {
              summary: result.recommendation.summary,
              recommendedFormula: JSON.stringify(result.recommendation.formula),
              technique: result.recommendation.technique,
              estimatedTime: result.recommendation.estimatedTime,
              difficulty: result.recommendation.difficulty,
              warnings: result.recommendation.warnings || [],
              tips: result.recommendation.tips || [],
              matchedEntryId: result.matchedEntries[0]?.id || null,
              matchConfidence: result.confidence,
              rawAiResponse: result as any,
            },
          },
        },
        include: { analysis: true },
      });
      analysisId = submission.analysis?.id || null;
    } catch (dbError) {
      console.error('Database write error:', dbError);
    }

    // Build response with remaining count + analysis ID for feedback
    const newUsed = used + 1;
    const remaining = limit === -1 ? -1 : limit - newUsed;

    const response = NextResponse.json({ ...result, analysisId, usage: { used: newUsed, limit, remaining } });

    // Set device cookie for anonymous users
    if (anonymousDeviceId) {
      response.cookies.set('colorlab_device', anonymousDeviceId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      });
    }

    return response;
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
