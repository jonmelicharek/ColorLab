import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const FREE_LIMIT = 3;

export async function GET(req: NextRequest) {
  try {
    // Check if logged-in user
    const sessionToken = req.cookies.get('session_token')?.value;
    if (sessionToken) {
      const stylist = await prisma.stylist.findUnique({ where: { sessionToken } });
      if (stylist) {
        // Monthly reset check
        const now = new Date();
        let used = stylist.freeAnalysesUsed;
        if (!stylist.monthlyResetAt || now > stylist.monthlyResetAt) {
          const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          await prisma.stylist.update({
            where: { id: stylist.id },
            data: { freeAnalysesUsed: 0, monthlyResetAt: nextReset },
          });
          used = 0;
        }

        let limit = FREE_LIMIT;
        if (stylist.plan === 'salon' || stylist.plan === 'enterprise') limit = -1;
        else if (stylist.plan === 'stylist') limit = 50;

        return NextResponse.json({
          used,
          limit,
          remaining: limit === -1 ? -1 : limit - used,
          authenticated: true,
        });
      }
    }

    // Anonymous user — check device cookie + IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const deviceId = req.cookies.get('colorlab_device')?.value;

    let usage = null;

    if (deviceId) {
      usage = await prisma.anonymousUsage.findUnique({ where: { deviceId } });
    }

    if (!usage) {
      usage = await prisma.anonymousUsage.findFirst({
        where: { ipAddress: ip },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!usage) {
      return NextResponse.json({
        used: 0,
        limit: FREE_LIMIT,
        remaining: FREE_LIMIT,
        authenticated: false,
      });
    }

    // Monthly reset check
    const now = new Date();
    let used = usage.analysesUsed;
    if (!usage.monthlyResetAt || now > usage.monthlyResetAt) {
      const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      await prisma.anonymousUsage.update({
        where: { id: usage.id },
        data: { analysesUsed: 0, monthlyResetAt: nextReset },
      });
      used = 0;
    }

    const response = NextResponse.json({
      used,
      limit: FREE_LIMIT,
      remaining: FREE_LIMIT - used,
      authenticated: false,
    });

    // Ensure device cookie is set
    if (usage.deviceId && !deviceId) {
      response.cookies.set('colorlab_device', usage.deviceId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Usage check error:', error);
    return NextResponse.json({ used: 0, limit: FREE_LIMIT, remaining: FREE_LIMIT, authenticated: false });
  }
}
