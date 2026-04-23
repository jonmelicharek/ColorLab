import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

// POST: Submit feedback on a formula
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const ipLimit = rateLimit(`feedback-ip:${ip}`, 30, 60 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await req.json();
    const {
      analysisId, rating, accuracy, formulaQuality,
      comment, whatWorked, whatFailed, actualResult,
      adjustmentsMade, afterPhotoUrl,
    } = body;

    if (!analysisId || !rating) {
      return NextResponse.json(
        { error: 'analysisId and rating are required' },
        { status: 400 }
      );
    }

    if (!['worked', 'partial', 'didnt_work'].includes(rating)) {
      return NextResponse.json(
        { error: 'rating must be: worked, partial, or didnt_work' },
        { status: 400 }
      );
    }

    // Verify the analysis exists
    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
    });

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    // Check if feedback already exists
    const existing = await prisma.formulaFeedback.findUnique({
      where: { analysisId },
    });

    // Get stylist ID from session if logged in
    let stylistId: string | null = null;
    const sessionToken = req.cookies.get('session_token')?.value;
    if (sessionToken) {
      const stylist = await prisma.stylist.findUnique({ where: { sessionToken } });
      if (stylist) stylistId = stylist.id;
    }

    const deviceId = req.cookies.get('colorlab_device')?.value || null;

    if (existing) {
      // Update existing feedback
      const updated = await prisma.formulaFeedback.update({
        where: { analysisId },
        data: {
          rating,
          accuracy: accuracy || null,
          formulaQuality: formulaQuality || null,
          comment: comment || null,
          whatWorked: whatWorked || null,
          whatFailed: whatFailed || null,
          actualResult: actualResult || null,
          adjustmentsMade: adjustmentsMade || null,
          afterPhotoUrl: afterPhotoUrl || null,
          stylistId,
          deviceId,
        },
      });
      return NextResponse.json({ feedback: updated, updated: true });
    }

    // Create new feedback
    const feedback = await prisma.formulaFeedback.create({
      data: {
        analysisId,
        rating,
        accuracy: accuracy || null,
        formulaQuality: formulaQuality || null,
        comment: comment || null,
        whatWorked: whatWorked || null,
        whatFailed: whatFailed || null,
        actualResult: actualResult || null,
        adjustmentsMade: adjustmentsMade || null,
        afterPhotoUrl: afterPhotoUrl || null,
        stylistId,
        deviceId,
      },
    });

    return NextResponse.json({ feedback });
  } catch (error: any) {
    console.error('Feedback error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save feedback' },
      { status: 500 }
    );
  }
}

// GET: Get feedback stats (admin only)
export async function GET(req: NextRequest) {
  try {
    const adminSecret = req.headers.get('x-admin-secret') ||
      req.nextUrl.searchParams.get('secret');
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [total, worked, partial, didntWork, recentFeedback] = await Promise.all([
      prisma.formulaFeedback.count(),
      prisma.formulaFeedback.count({ where: { rating: 'worked' } }),
      prisma.formulaFeedback.count({ where: { rating: 'partial' } }),
      prisma.formulaFeedback.count({ where: { rating: 'didnt_work' } }),
      prisma.formulaFeedback.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          analysis: {
            select: { summary: true, technique: true, matchConfidence: true },
          },
        },
      }),
    ]);

    // Average accuracy and formula quality scores
    const avgScores = await prisma.formulaFeedback.aggregate({
      _avg: { accuracy: true, formulaQuality: true },
      where: { accuracy: { not: null } },
    });

    return NextResponse.json({
      stats: {
        total,
        worked,
        partial,
        didntWork,
        successRate: total > 0 ? ((worked / total) * 100).toFixed(1) : 0,
        avgAccuracy: avgScores._avg.accuracy?.toFixed(1) || 'N/A',
        avgFormulaQuality: avgScores._avg.formulaQuality?.toFixed(1) || 'N/A',
      },
      recentFeedback,
    });
  } catch (error: any) {
    console.error('Feedback stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
