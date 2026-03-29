import { NextRequest, NextResponse } from 'next/server';
import { generatePost, formatCaption } from '@/lib/social-content';
import { postImage } from '@/lib/instagram';
import prisma from '@/lib/prisma';

export const maxDuration = 60;

// This endpoint is called by Vercel Cron daily at 10:00 AM EST
// See vercel.json for the cron schedule configuration

export async function GET(req: NextRequest) {
  try {
    // Verify this is from Vercel Cron or admin
    const authHeader = req.headers.get('authorization');
    const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    const isAdmin = req.nextUrl.searchParams.get('secret') === process.env.ADMIN_SECRET;

    if (!isVercelCron && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if we already posted today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingPost = await prisma.socialPost.findFirst({
      where: {
        publishedAt: { gte: today },
        status: 'published',
      },
    });

    if (existingPost) {
      return NextResponse.json({
        skipped: true,
        message: 'Already posted today',
        post: existingPost,
      });
    }

    // Check if Instagram is configured
    if (!process.env.INSTAGRAM_ACCESS_TOKEN || !process.env.INSTAGRAM_USER_ID) {
      // Generate and save as draft if Instagram isn't connected yet
      const post = await generatePost();
      const caption = formatCaption(post);

      const saved = await prisma.socialPost.create({
        data: {
          caption,
          imageUrl: null,
          imagePrompt: post.imagePrompt,
          postType: post.postType,
          hook: post.hook,
          status: 'draft',
        },
      });

      return NextResponse.json({
        mode: 'draft',
        message: 'Instagram not connected — post saved as draft. Connect Instagram to auto-publish.',
        post: saved,
      });
    }

    // Generate AI content
    const post = await generatePost();
    const caption = formatCaption(post);

    // For automated posts, we need an image URL.
    // Check if there's a queued image, or use a default brand image
    const defaultImageUrl = process.env.DEFAULT_POST_IMAGE_URL;

    if (!defaultImageUrl) {
      // Save as draft — no image available
      const saved = await prisma.socialPost.create({
        data: {
          caption,
          imageUrl: null,
          imagePrompt: post.imagePrompt,
          postType: post.postType,
          hook: post.hook,
          status: 'draft',
        },
      });

      return NextResponse.json({
        mode: 'draft',
        message: 'No image available — post saved as draft. Set DEFAULT_POST_IMAGE_URL or upload images via dashboard.',
        post: saved,
      });
    }

    // Publish to Instagram
    const result = await postImage(defaultImageUrl, caption);

    // Save published post
    const saved = await prisma.socialPost.create({
      data: {
        igMediaId: result.id,
        permalink: result.permalink || null,
        caption,
        imageUrl: defaultImageUrl,
        imagePrompt: post.imagePrompt,
        postType: post.postType,
        hook: post.hook,
        status: 'published',
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      mediaId: result.id,
      permalink: result.permalink,
      post: saved,
    });
  } catch (error: any) {
    console.error('Cron social post error:', error);

    // Save the error for debugging
    try {
      await prisma.socialPost.create({
        data: {
          caption: `[CRON ERROR] ${error.message}`,
          status: 'failed',
          postType: 'auto',
        },
      });
    } catch {
      // ignore DB error on error logging
    }

    return NextResponse.json(
      { error: error.message || 'Cron social post failed' },
      { status: 500 }
    );
  }
}
