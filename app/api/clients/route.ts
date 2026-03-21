import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

async function getUser(req: NextRequest) {
  const token = req.cookies.get('colorlab_session')?.value;
  if (!token) return null;
  return prisma.stylist.findUnique({ where: { sessionToken: token } });
}

// GET — List clients
export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const clients = await prisma.client.findMany({
    where: { stylistId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: { select: { savedFormulas: true } },
    },
  });

  return NextResponse.json({ clients });
}

// POST — Create client
export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json();
  const { name, email, phone, instagram, notes, naturalLevel, currentColor, hairType, porosity, condition, grayPercentage, allergies } = body;

  if (!name) {
    return NextResponse.json({ error: 'Client name is required' }, { status: 400 });
  }

  const client = await prisma.client.create({
    data: {
      stylistId: user.id,
      name,
      email: email || null,
      phone: phone || null,
      instagram: instagram || null,
      notes: notes || null,
      naturalLevel: naturalLevel ? parseInt(naturalLevel) : null,
      currentColor: currentColor || null,
      hairType: hairType || null,
      porosity: porosity || null,
      condition: condition || null,
      grayPercentage: grayPercentage ? parseInt(grayPercentage) : null,
      allergies: allergies || null,
    },
  });

  return NextResponse.json({ success: true, client });
}

// PUT — Update client
export async function PUT(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json();
  const { id, ...data } = body;

  if (!id) return NextResponse.json({ error: 'Client ID required' }, { status: 400 });

  // Verify ownership
  const existing = await prisma.client.findFirst({ where: { id, stylistId: user.id } });
  if (!existing) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  if (data.naturalLevel) data.naturalLevel = parseInt(data.naturalLevel);
  if (data.grayPercentage) data.grayPercentage = parseInt(data.grayPercentage);

  const client = await prisma.client.update({ where: { id }, data });
  return NextResponse.json({ success: true, client });
}

// DELETE — Delete client
export async function DELETE(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Client ID required' }, { status: 400 });

  const existing = await prisma.client.findFirst({ where: { id, stylistId: user.id } });
  if (!existing) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  // Delete related saved formulas first
  await prisma.savedFormula.deleteMany({ where: { clientId: id } });
  await prisma.client.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
