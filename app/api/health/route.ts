import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const health: Record<string, any> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  };

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.database = 'connected';
  } catch (error) {
    health.database = 'disconnected';
    health.status = 'degraded';
  }

  // Check Anthropic API key presence
  health.anthropicKey = process.env.ANTHROPIC_API_KEY ? 'configured' : 'missing';
  if (!process.env.ANTHROPIC_API_KEY) health.status = 'degraded';

  // Check Blob storage
  health.blobStorage = process.env.BLOB_READ_WRITE_TOKEN ? 'configured' : 'not configured';

  // Check Resend
  health.email = process.env.RESEND_API_KEY ? 'configured' : 'not configured';

  // Database counts
  try {
    const [formulas, leads, submissions] = await Promise.all([
      prisma.formulaEntry.count(),
      prisma.lead.count(),
      prisma.submission.count(),
    ]);
    health.counts = { formulas, leads, submissions };
  } catch {
    health.counts = 'unavailable';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}
