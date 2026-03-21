import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET — Get current user from session
export async function GET(req: NextRequest) {
  const token = req.cookies.get('colorlab_session')?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  const stylist = await prisma.stylist.findUnique({
    where: { sessionToken: token },
    include: {
      _count: {
        select: { clients: true, savedFormulas: true, submissions: true },
      },
    },
  });

  if (!stylist) {
    const response = NextResponse.json({ user: null });
    response.cookies.delete('colorlab_session');
    return response;
  }

  // Reset monthly analyses if needed
  const now = new Date();
  if (!stylist.monthlyResetAt || now.getMonth() !== stylist.monthlyResetAt.getMonth()) {
    await prisma.stylist.update({
      where: { id: stylist.id },
      data: { freeAnalysesUsed: 0, monthlyResetAt: now },
    });
    stylist.freeAnalysesUsed = 0;
  }

  return NextResponse.json({
    user: {
      id: stylist.id,
      email: stylist.email,
      name: stylist.name,
      salon: stylist.salon,
      city: stylist.city,
      state: stylist.state,
      phone: stylist.phone,
      instagram: stylist.instagram,
      plan: stylist.plan,
      planStatus: stylist.planStatus,
      hasWhyAddon: stylist.hasWhyAddon,
      analysisCount: stylist.analysisCount,
      freeAnalysesUsed: stylist.freeAnalysesUsed,
      clientCount: stylist._count.clients,
      formulaCount: stylist._count.savedFormulas,
    },
  });
}

// PUT — Update profile
export async function PUT(req: NextRequest) {
  const token = req.cookies.get('colorlab_session')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const stylist = await prisma.stylist.findUnique({ where: { sessionToken: token } });
  if (!stylist) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await req.json();
  const { name, salon, city, state, phone, instagram } = body;

  const updated = await prisma.stylist.update({
    where: { id: stylist.id },
    data: {
      name: name || stylist.name,
      salon: salon ?? stylist.salon,
      city: city ?? stylist.city,
      state: state ?? stylist.state,
      phone: phone ?? stylist.phone,
      instagram: instagram ?? stylist.instagram,
    },
  });

  return NextResponse.json({ success: true, user: updated });
}
