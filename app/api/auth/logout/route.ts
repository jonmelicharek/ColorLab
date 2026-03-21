import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('colorlab_session')?.value;

  if (token) {
    await prisma.stylist.updateMany({
      where: { sessionToken: token },
      data: { sessionToken: null },
    });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete('colorlab_session');
  return response;
}
