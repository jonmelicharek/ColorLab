import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { rateLimit } from '@/lib/rate-limit';

// POST — Verify login code and create session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code required.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limit: 10 verify attempts per email per 15 minutes (prevents brute force)
    const limit = rateLimit(`verify:${normalizedEmail}`, 10, 15 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ error: 'Too many attempts. Please request a new code.' }, { status: 429 });
    }

    const stylist = await prisma.stylist.findUnique({
      where: { email: normalizedEmail },
    });

    if (!stylist) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
    }

    if (!stylist.authCode || !stylist.authCodeExpiry) {
      return NextResponse.json({ error: 'No pending login code. Request a new one.' }, { status: 400 });
    }

    if (new Date() > stylist.authCodeExpiry) {
      return NextResponse.json({ error: 'Code expired. Request a new one.' }, { status: 400 });
    }

    if (stylist.authCode !== code) {
      return NextResponse.json({ error: 'Invalid code.' }, { status: 400 });
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex');

    // Reset monthly analyses if needed
    const now = new Date();
    const resetData: any = {};
    if (!stylist.monthlyResetAt || now.getMonth() !== stylist.monthlyResetAt.getMonth()) {
      resetData.freeAnalysesUsed = 0;
      resetData.monthlyResetAt = now;
    }

    // Update stylist
    await prisma.stylist.update({
      where: { id: stylist.id },
      data: {
        sessionToken,
        authCode: null,
        authCodeExpiry: null,
        lastLoginAt: now,
        ...resetData,
      },
    });

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: stylist.id,
        email: stylist.email,
        name: stylist.name,
        salon: stylist.salon,
        plan: stylist.plan,
        hasWhyAddon: stylist.hasWhyAddon,
        analysisCount: stylist.analysisCount,
        freeAnalysesUsed: resetData.freeAnalysesUsed ?? stylist.freeAnalysesUsed,
      },
      token: sessionToken,
    });

    // Set httpOnly cookie
    response.cookies.set('colorlab_session', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
