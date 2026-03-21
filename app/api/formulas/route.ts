import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function checkAdmin(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret') || req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return false;
  }
  return true;
}

// GET — List all formula entries
export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const entries = await prisma.formulaEntry.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { analyses: true } } },
  });

  return NextResponse.json({ entries, total: entries.length });
}

// POST — Create a new formula entry
export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const entry = await prisma.formulaEntry.create({
      data: {
        beforeImageUrl: body.beforeImageUrl,
        beforeHairColor: body.beforeHairColor,
        beforeHairType: body.beforeHairType || null,
        beforeCondition: body.beforeCondition || null,
        beforeLevel: body.beforeLevel ? parseInt(body.beforeLevel) : null,
        afterImageUrl: body.afterImageUrl,
        afterHairColor: body.afterHairColor,
        afterLevel: body.afterLevel ? parseInt(body.afterLevel) : null,
        technique: body.technique,
        formulaDetails: body.formulaDetails,
        colorBrand: body.colorBrand || null,
        colorLine: body.colorLine || null,
        colorShades: body.colorShades || [],
        developer: body.developer || null,
        developerRatio: body.developerRatio || null,
        lightener: body.lightener || null,
        lightenerMix: body.lightenerMix || null,
        toner: body.toner || null,
        tonerDeveloper: body.tonerDeveloper || null,
        additives: body.additives || [],
        processingTime: body.processingTime || null,
        tags: body.tags || [],
        difficulty: body.difficulty || null,
        priceRange: body.priceRange || null,
        estimatedTime: body.estimatedTime || null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({ success: true, entry });
  } catch (error: any) {
    console.error('Formula create error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT — Update an existing formula entry
export async function PUT(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // Parse integer fields
    if (data.beforeLevel) data.beforeLevel = parseInt(data.beforeLevel);
    if (data.afterLevel) data.afterLevel = parseInt(data.afterLevel);

    const entry = await prisma.formulaEntry.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, entry });
  } catch (error: any) {
    console.error('Formula update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — Remove a formula entry
export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  await prisma.formulaEntry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
