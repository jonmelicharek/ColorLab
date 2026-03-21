import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

async function getUser(req: NextRequest) {
  const token = req.cookies.get('colorlab_session')?.value;
  if (!token) return null;
  return prisma.stylist.findUnique({ where: { sessionToken: token } });
}

// GET — List saved formulas
export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const clientId = req.nextUrl.searchParams.get('clientId');

  const formulas = await prisma.savedFormula.findMany({
    where: {
      stylistId: user.id,
      ...(clientId ? { clientId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ formulas });
}

// POST — Save a formula
export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json();
  const { clientId, clientImageUrl, inspoImageUrl, analysisResult, notes } = body;

  if (!analysisResult) {
    return NextResponse.json({ error: 'Analysis result is required' }, { status: 400 });
  }

  // If clientId provided, verify ownership
  if (clientId) {
    const client = await prisma.client.findFirst({ where: { id: clientId, stylistId: user.id } });
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const formula = await prisma.savedFormula.create({
    data: {
      stylistId: user.id,
      clientId: clientId || null,
      clientImageUrl: clientImageUrl || null,
      inspoImageUrl: inspoImageUrl || null,
      analysisResult,
      notes: notes || null,
    },
  });

  return NextResponse.json({ success: true, formula });
}

// PUT — Update saved formula (toggle favorite, add notes, assign client)
export async function PUT(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json();
  const { id, ...data } = body;

  if (!id) return NextResponse.json({ error: 'Formula ID required' }, { status: 400 });

  const existing = await prisma.savedFormula.findFirst({ where: { id, stylistId: user.id } });
  if (!existing) return NextResponse.json({ error: 'Formula not found' }, { status: 404 });

  const formula = await prisma.savedFormula.update({ where: { id }, data });
  return NextResponse.json({ success: true, formula });
}

// DELETE — Delete saved formula
export async function DELETE(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Formula ID required' }, { status: 400 });

  const existing = await prisma.savedFormula.findFirst({ where: { id, stylistId: user.id } });
  if (!existing) return NextResponse.json({ error: 'Formula not found' }, { status: 404 });

  await prisma.savedFormula.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
