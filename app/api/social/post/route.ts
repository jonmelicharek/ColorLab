import { NextRequest, NextResponse } from 'next/server';
import { postImage, postCarousel } from '@/lib/instagram';
import prisma from '@/lib/prisma';

// POST: Publish a post to Instagram
export async function POST(req: NextRequest) {
  try {
    const adminSecret = req.headers.get('x-admin-secret');
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrl, imageUrls, caption } = await req.json();

    if (!caption) {
      return NextResponse.json({ error: 'Caption is required' }, { status: 400 });
    }

    let result;
    if (imageUrls && imageUrls.length >= 2) {
      result = await postCarousel(imageUrls, caption);
    } else if (imageUrl) {
      result = await postImage(imageUrl, caption);
    } else {
      return NextResponse.json(
        { error: 'Provide imageUrl (single) or imageUrls (carousel, 2-10)' },
        { status: 400 }
      );
    }

    // Save to database
    try {
      await prisma.socialPost.create({
        data: {
          igMediaId: result.id,
          permalink: result.permalink || null,
          caption,
          imageUrl: imageUrl || imageUrls[0],
          postType: 'manual',
          status: 'published',
          publishedAt: new Date(),
        },
      });
    } catch (dbErr) {
      console.error('Failed to save social post to DB:', dbErr);
    }

    return NextResponse.json({
      success: true,
      mediaId: result.id,
      permalink: result.permalink,
    });
  } catch (error: any) {
    console.error('Social post error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to post to Instagram' },
      { status: 500 }
    );
  }
}

// GET: List recent posts
export async function GET(req: NextRequest) {
  try {
    const adminSecret = req.headers.get('x-admin-secret') ||
      req.nextUrl.searchParams.get('secret');
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const posts = await prisma.socialPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error('Social posts list error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
