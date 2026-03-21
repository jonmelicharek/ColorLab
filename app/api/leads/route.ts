import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, salon, city, phone, instagram, source } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required.' }, { status: 400 });
    }

    // Extract UTM params
    const url = new URL(req.url);
    const utmSource = url.searchParams.get('utm_source') || body.utmSource;
    const utmMedium = url.searchParams.get('utm_medium') || body.utmMedium;
    const utmCampaign = url.searchParams.get('utm_campaign') || body.utmCampaign;

    const lead = await prisma.lead.upsert({
      where: { email: email.toLowerCase().trim() },
      update: {
        name: name || undefined,
        salon: salon || undefined,
        city: city || undefined,
        phone: phone || undefined,
        instagram: instagram || undefined,
      },
      create: {
        email: email.toLowerCase().trim(),
        name,
        salon,
        city,
        phone,
        instagram,
        source: source || 'waitlist',
        utmSource,
        utmMedium,
        utmCampaign,
      },
    });

    // Optional: Send welcome email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'ColorLab AI <hello@colorlab.me>',
          to: email,
          subject: "You're on the ColorLab AI waitlist! 🎨",
          html: `
            <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; color: #3D2E1F;">
              <h1 style="font-size: 28px; font-weight: 500;">Welcome to ColorLab AI</h1>
              <p style="color: #8A7E72; line-height: 1.7;">
                You're on the early access list! We'll notify you when new features launch and when we expand our formula database.
              </p>
              <p style="color: #8A7E72; line-height: 1.7;">
                In the meantime, you can already <a href="${process.env.NEXT_PUBLIC_APP_URL}/upload" style="color: #C8874B;">try the free formula analyzer</a> — no account needed.
              </p>
              <hr style="border: none; border-top: 1px solid #E8DFD5; margin: 24px 0;" />
              <p style="color: #C4B5A5; font-size: 12px;">ColorLab AI — Smart formulas for professional colorists.</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('Email send error:', emailErr);
      }
    }

    return NextResponse.json({ success: true, id: lead.id });
  } catch (error: any) {
    // Handle unique constraint (already exists)
    if (error.code === 'P2002') {
      return NextResponse.json({ success: true, message: 'Already registered!' });
    }
    console.error('Lead capture error:', error);
    return NextResponse.json({ error: 'Failed to save.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Admin-only: list leads
  const secret = req.headers.get('x-admin-secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return NextResponse.json({ leads, total: leads.length });
}
