import { NextRequest, NextResponse } from 'next/server';
import { generatePost, formatCaption, type PostType } from '@/lib/social-content';

// POST: Generate a new social media post (does NOT publish)
export async function POST(req: NextRequest) {
  try {
    const adminSecret = req.headers.get('x-admin-secret');
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const postType = body.postType as PostType | undefined;
    const context = body.context as string | undefined;

    const post = await generatePost(postType, context);
    const formattedCaption = formatCaption(post);

    return NextResponse.json({
      ...post,
      formattedCaption,
    });
  } catch (error: any) {
    console.error('Social generate error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate post' },
      { status: 500 }
    );
  }
}
