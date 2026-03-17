import { NextResponse } from "next/server";

interface ApprovedPost {
  postNumber: number;
  postType: string;
  scheduledDay: number;
  platforms: Record<string, string>;
}

interface PushResult {
  postNumber: number;
  platform: string;
  success: boolean;
  postizPostId?: string;
  error?: string;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  const apiUrl = process.env.POSTIZ_API_URL;
  const apiKey = process.env.POSTIZ_API_KEY;

  if (!apiUrl || !apiKey) {
    return NextResponse.json(
      { error: "Postiz not configured. Set POSTIZ_API_URL and POSTIZ_API_KEY." },
      { status: 503 }
    );
  }

  try {
    const {
      posts,
      integrations,
      publicationDate,
      defaultTime,
      articleSlug,
    } = await request.json();

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json(
        { error: "No posts to push" },
        { status: 400 }
      );
    }

    if (!integrations || Object.keys(integrations).length === 0) {
      return NextResponse.json(
        { error: "No integrations configured" },
        { status: 400 }
      );
    }

    if (!publicationDate) {
      return NextResponse.json(
        { error: "Publication date required" },
        { status: 400 }
      );
    }

    const results: PushResult[] = [];
    const [hours, minutes] = (defaultTime || "09:00").split(":").map(Number);

    for (const post of posts as ApprovedPost[]) {
      for (const [platform, content] of Object.entries(post.platforms)) {
        const integrationId = integrations[platform];
        if (!integrationId || !content) continue;

        // Calculate scheduled date
        const pubDate = new Date(publicationDate);
        pubDate.setDate(pubDate.getDate() + post.scheduledDay);
        pubDate.setHours(hours, minutes, 0, 0);
        const scheduledDate = pubDate.toISOString();

        // Try to get recommended slot from Postiz
        let slotDate = scheduledDate;
        try {
          const slotResponse = await fetch(
            `${apiUrl}/find-slot/${integrationId}`,
            { headers: { Authorization: apiKey } }
          );
          if (slotResponse.ok) {
            const slotData = await slotResponse.json();
            if (slotData.slot) {
              slotDate = slotData.slot;
            }
          }
        } catch {
          // Use default time
        }

        // Push as draft
        try {
          const postBody = {
            type: "draft",
            date: slotDate,
            posts: [
              {
                integration: { id: integrationId },
                value: [{ content }],
                group: `pp-${articleSlug || "content"}-${post.postNumber}`,
              },
            ],
          };

          const pushResponse = await fetch(`${apiUrl}/posts`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: apiKey,
            },
            body: JSON.stringify(postBody),
          });

          if (pushResponse.ok) {
            const pushData = await pushResponse.json();
            results.push({
              postNumber: post.postNumber,
              platform,
              success: true,
              postizPostId: pushData.id,
            });
          } else {
            const errorText = await pushResponse.text();
            results.push({
              postNumber: post.postNumber,
              platform,
              success: false,
              error: errorText,
            });
          }
        } catch (error) {
          results.push({
            postNumber: post.postNumber,
            platform,
            success: false,
            error: String(error),
          });
        }

        // Rate limit: 200ms between requests
        await delay(200);
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
