import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { canAnalyze, getPlanLimits } from '@/lib/stripe';

// Check if a user can analyze (and track usage)
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');

  if (!email) {
    // No email = anonymous free user, check localStorage on client
    return NextResponse.json({
      plan: 'free',
      canAnalyze: true, // client-side tracks anonymous usage
      used: 0,
      limit: 3,
      hasWhyAddon: false,
    });
  }

  const stylist = await prisma.stylist.findUnique({ where: { email } });

  if (!stylist) {
    return NextResponse.json({
      plan: 'free',
      canAnalyze: true,
      used: 0,
      limit: 3,
      hasWhyAddon: false,
    });
  }

  const limit = getPlanLimits(stylist.plan);
  const allowed = canAnalyze(stylist.plan, stylist.freeAnalysesUsed);

  return NextResponse.json({
    plan: stylist.plan,
    canAnalyze: allowed,
    used: stylist.freeAnalysesUsed,
    limit: limit === -1 ? 'unlimited' : limit,
    hasWhyAddon: stylist.hasWhyAddon,
    planStatus: stylist.planStatus,
  });
}

// Increment usage after an analysis
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json({ success: true }); // anonymous, tracked client-side
  }

  const stylist = await prisma.stylist.findUnique({ where: { email } });
  if (stylist) {
    await prisma.stylist.update({
      where: { id: stylist.id },
      data: {
        freeAnalysesUsed: { increment: 1 },
        analysisCount: { increment: 1 },
      },
    });
  }

  return NextResponse.json({ success: true });
}
