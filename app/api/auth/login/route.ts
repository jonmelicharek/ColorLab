import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

// POST — Send login code to email
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Find or create stylist
    let stylist = await prisma.stylist.findUnique({ where: { email: normalizedEmail } });
    if (!stylist) {
      stylist = await prisma.stylist.create({
        data: {
          email: normalizedEmail,
          name: normalizedEmail.split('@')[0],
        },
      });
    }

    // Save code
    await prisma.stylist.update({
      where: { id: stylist.id },
      data: { authCode: code, authCodeExpiry: expiry },
    });

    // Send code via Resend if configured, otherwise log it
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'ColorLab AI <hello@colorlab.me>',
          to: normalizedEmail,
          subject: `Your ColorLab login code: ${code}`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 400px; margin: 0 auto; color: #3D2E1F; text-align: center;">
              <h1 style="font-size: 24px; font-weight: 500;">Your Login Code</h1>
              <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; background: #F5F0EB; padding: 20px; border-radius: 12px; margin: 20px 0;">
                ${code}
              </div>
              <p style="color: #8A7E72; font-size: 14px;">This code expires in 10 minutes.</p>
              <hr style="border: none; border-top: 1px solid #E8DFD5; margin: 24px 0;" />
              <p style="color: #C4B5A5; font-size: 12px;">ColorLab AI — Smart formulas for professional colorists.</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('Email send error:', emailErr);
      }
    } else {
      // No email service — log code for development
      console.log(`Login code for ${normalizedEmail}: ${code}`);
    }

    return NextResponse.json({ success: true, message: 'Code sent to your email.' });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
