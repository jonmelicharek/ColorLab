// ===========================================
// ColorLab AI — Instagram Graph API Integration
// ===========================================
// Posts images + carousels to Instagram via Meta Graph API.
// Requires: Instagram Professional account + Facebook Page + Meta App.
//
// Setup guide:
// 1. Go to developers.facebook.com → Create App → Business type
// 2. Add "Instagram Graph API" product
// 3. Link your Facebook Page to your Instagram Professional account
// 4. Generate a long-lived access token (60-day, auto-refreshed below)
// 5. Get your Instagram Business Account ID from the API Explorer

const GRAPH_API = 'https://graph.facebook.com/v21.0';

interface InstagramConfig {
  accessToken: string;
  igUserId: string;
}

function getConfig(): InstagramConfig {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igUserId = process.env.INSTAGRAM_USER_ID;

  if (!accessToken || !igUserId) {
    throw new Error('Instagram not configured. Set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID env vars.');
  }

  return { accessToken, igUserId };
}

// ─── Post a single image with caption ────────────────────────

export async function postImage(imageUrl: string, caption: string): Promise<{ id: string; permalink?: string }> {
  const { accessToken, igUserId } = getConfig();

  // Step 1: Create media container
  const containerRes = await fetch(`${GRAPH_API}/${igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_url: imageUrl,
      caption,
      access_token: accessToken,
    }),
  });

  if (!containerRes.ok) {
    const err = await containerRes.json();
    throw new Error(`Instagram container error: ${JSON.stringify(err.error)}`);
  }

  const { id: containerId } = await containerRes.json();

  // Step 2: Wait for container to be ready (Instagram processes async)
  await waitForContainer(containerId, accessToken);

  // Step 3: Publish
  const publishRes = await fetch(`${GRAPH_API}/${igUserId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: containerId,
      access_token: accessToken,
    }),
  });

  if (!publishRes.ok) {
    const err = await publishRes.json();
    throw new Error(`Instagram publish error: ${JSON.stringify(err.error)}`);
  }

  const { id: mediaId } = await publishRes.json();

  // Get permalink
  try {
    const mediaRes = await fetch(`${GRAPH_API}/${mediaId}?fields=permalink&access_token=${accessToken}`);
    const mediaData = await mediaRes.json();
    return { id: mediaId, permalink: mediaData.permalink };
  } catch {
    return { id: mediaId };
  }
}

// ─── Post a carousel (multiple images) ──────────────────────

export async function postCarousel(
  imageUrls: string[],
  caption: string
): Promise<{ id: string; permalink?: string }> {
  const { accessToken, igUserId } = getConfig();

  if (imageUrls.length < 2 || imageUrls.length > 10) {
    throw new Error('Carousel requires 2-10 images');
  }

  // Step 1: Create individual media containers for each image
  const childIds: string[] = [];
  for (const url of imageUrls) {
    const res = await fetch(`${GRAPH_API}/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: url,
        is_carousel_item: true,
        access_token: accessToken,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Instagram carousel item error: ${JSON.stringify(err.error)}`);
    }

    const { id } = await res.json();
    await waitForContainer(id, accessToken);
    childIds.push(id);
  }

  // Step 2: Create carousel container
  const carouselRes = await fetch(`${GRAPH_API}/${igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_type: 'CAROUSEL',
      children: childIds.join(','),
      caption,
      access_token: accessToken,
    }),
  });

  if (!carouselRes.ok) {
    const err = await carouselRes.json();
    throw new Error(`Instagram carousel error: ${JSON.stringify(err.error)}`);
  }

  const { id: carouselId } = await carouselRes.json();
  await waitForContainer(carouselId, accessToken);

  // Step 3: Publish
  const publishRes = await fetch(`${GRAPH_API}/${igUserId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: carouselId,
      access_token: accessToken,
    }),
  });

  if (!publishRes.ok) {
    const err = await publishRes.json();
    throw new Error(`Instagram carousel publish error: ${JSON.stringify(err.error)}`);
  }

  const { id: mediaId } = await publishRes.json();

  try {
    const mediaRes = await fetch(`${GRAPH_API}/${mediaId}?fields=permalink&access_token=${accessToken}`);
    const mediaData = await mediaRes.json();
    return { id: mediaId, permalink: mediaData.permalink };
  } catch {
    return { id: mediaId };
  }
}

// ─── Refresh long-lived token (call before expiry) ──────────

export async function refreshAccessToken(): Promise<string> {
  const { accessToken } = getConfig();

  const res = await fetch(
    `${GRAPH_API}/oauth/access_token?grant_type=fb_exchange_token` +
    `&client_id=${process.env.META_APP_ID}` +
    `&client_secret=${process.env.META_APP_SECRET}` +
    `&fb_exchange_token=${accessToken}`
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Token refresh error: ${JSON.stringify(err.error)}`);
  }

  const data = await res.json();
  // In production, you'd save this new token to your env/database
  console.log('[Instagram] New access token generated, expires in', data.expires_in, 'seconds');
  return data.access_token;
}

// ─── Helper: wait for media container processing ─────────────

async function waitForContainer(containerId: string, accessToken: string, maxAttempts = 20): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${GRAPH_API}/${containerId}?fields=status_code&access_token=${accessToken}`
    );
    const data = await res.json();

    if (data.status_code === 'FINISHED') return;
    if (data.status_code === 'ERROR') {
      throw new Error(`Instagram media processing failed: ${JSON.stringify(data)}`);
    }

    // Wait 2 seconds between checks
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error('Instagram media processing timed out');
}
