import { NextRequest, NextResponse } from 'next/server';
import { analyzePhotos } from '@/lib/ai-engine';
import prisma from '@/lib/prisma';

export const maxDuration = 60; // Allow up to 60s for AI processing

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientImage, clientMediaType, inspoImage, inspoMediaType } = body;

    if (!clientImage || !inspoImage) {
      return NextResponse.json(
        { error: 'Both client and inspiration images are required.' },
        { status: 400 }
      );
    }

    // Run the full AI analysis pipeline
    const result = await analyzePhotos(
      clientImage,
      inspoImage,
      clientMediaType || 'image/jpeg',
      inspoMediaType || 'image/jpeg'
    );

    // Save submission to database
    try {
      const submission = await prisma.submission.create({
        data: {
          clientImageUrl: `data:${clientMediaType};base64,${clientImage.slice(0, 100)}...`, // Store reference, not full base64
          inspoImageUrl: `data:${inspoMediaType};base64,${inspoImage.slice(0, 100)}...`,
          clientHairInfo: result.clientAnalysis as any,
          inspoHairInfo: result.inspoAnalysis as any,
          analysis: {
            create: {
              summary: result.recommendation.summary,
              recommendedFormula: JSON.stringify(result.recommendation.formula),
              technique: result.recommendation.technique,
              estimatedTime: result.recommendation.estimatedTime,
              difficulty: result.recommendation.difficulty,
              warnings: result.recommendation.warnings || [],
              tips: result.recommendation.tips || [],
              matchedEntryId: result.matchedEntries[0]?.id || null,
              matchConfidence: result.confidence,
              rawAiResponse: result as any,
            },
          },
        },
      });
    } catch (dbError) {
      // Don't fail the request if DB write fails — still return the analysis
      console.error('Database write error:', dbError);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
