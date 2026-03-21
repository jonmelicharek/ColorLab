import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST — Register a salon
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      salonName, ownerName, email, phone, city, state,
      zipCode, website, instagram, preferredServices, serviceRadius,
    } = body;

    if (!salonName || !ownerName || !email) {
      return NextResponse.json({ error: 'Salon name, owner name, and email are required.' }, { status: 400 });
    }

    const salon = await prisma.salonAccount.create({
      data: {
        salonName,
        ownerName,
        email: email.toLowerCase().trim(),
        phone: phone || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        website: website || null,
        instagram: instagram || null,
        preferredServices: preferredServices || [],
        serviceRadius: serviceRadius || 25,
      },
    });

    return NextResponse.json({ success: true, id: salon.id });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'This email is already registered.' }, { status: 409 });
    }
    console.error('Salon registration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET — List salons (admin only)
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret') || req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const salons = await prisma.salonAccount.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { purchasedLeads: true } },
    },
  });

  return NextResponse.json({ salons, total: salons.length });
}
