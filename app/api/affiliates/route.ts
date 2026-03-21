import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST — Submit affiliate application
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brandName, contactName, contactEmail, phone, website, productLines, message } = body;

    if (!brandName || !contactName || !contactEmail) {
      return NextResponse.json({ error: 'Brand name, contact name, and email are required.' }, { status: 400 });
    }

    // Generate a unique affiliate code
    const code = brandName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) + '-' + Math.random().toString(36).slice(2, 8);

    const affiliate = await prisma.affiliate.create({
      data: {
        brandName,
        contactName,
        contactEmail: contactEmail.toLowerCase().trim(),
        phone: phone || null,
        website: website || null,
        productLines: productLines || [],
        colorBrands: [brandName],
        affiliateCode: code,
        notes: message || null,
        status: 'pending',
      },
    });

    return NextResponse.json({ success: true, id: affiliate.id, code: affiliate.affiliateCode });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'This email is already registered as an affiliate.' }, { status: 409 });
    }
    console.error('Affiliate create error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET — List affiliates (admin only)
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret') || req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const affiliates = await prisma.affiliate.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ affiliates, total: affiliates.length });
}

// PUT — Update affiliate status (admin only)
export async function PUT(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...data } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  const affiliate = await prisma.affiliate.update({
    where: { id },
    data: {
      ...data,
      approvedAt: data.status === 'approved' || data.status === 'active' ? new Date() : undefined,
    },
  });

  return NextResponse.json({ success: true, affiliate });
}
