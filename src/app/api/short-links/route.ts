import { NextRequest, NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateUrl } from "@/lib/qr/validate-url";
import { validateSlug } from "@/lib/shortlink/validate-slug";
import { generateSlug } from "@/lib/shortlink/generate-slug";

type CreateBody = {
  url?: unknown;
  slug?: unknown;
};

// ---------------------------------------------------------------------------
// Simple in-memory rate limiter (per IP, 10 requests / 60 seconds)
// ---------------------------------------------------------------------------

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

const rateLimitMap = new Map<string, number[]>();

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(ip: string): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];

  // Prune entries outside the window
  const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (valid.length >= RATE_LIMIT_MAX) {
    const oldest = valid[0]!;
    const retryAfter = Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000);
    rateLimitMap.set(ip, valid);
    return { limited: true, retryAfter };
  }

  valid.push(now);
  rateLimitMap.set(ip, valid);
  return { limited: false, retryAfter: 0 };
}

export async function GET() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("short_links")
    .select("id, slug, original_url, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 200 });
}

export async function POST(request: NextRequest) {
  // Rate limit check
  const ip = getClientIp(request);
  const rateCheck = isRateLimited(ip);

  if (rateCheck.limited) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateCheck.retryAfter) },
      },
    );
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const body = (await request.json()) as CreateBody;

  // Validate URL
  if (typeof body.url !== "string") {
    return NextResponse.json({ error: "URL is required." }, { status: 400 });
  }

  const parsedUrl = validateUrl(body.url);

  if (!parsedUrl.valid) {
    return NextResponse.json({ error: `Invalid URL: ${parsedUrl.error}` }, { status: 400 });
  }

  // Validate or generate slug
  const isCustomSlug = !!(body.slug && typeof body.slug === "string" && body.slug.trim());
  let finalSlug: string;

  if (isCustomSlug) {
    const parsedSlug = validateSlug(body.slug as string);

    if (!parsedSlug.valid) {
      return NextResponse.json({ error: `Invalid slug: ${parsedSlug.error}` }, { status: 400 });
    }

    finalSlug = parsedSlug.slug;
  } else {
    finalSlug = generateSlug();
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  // Get user if logged in (optional — anonymous is allowed)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const MAX_RETRIES = 5;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const { error } = await supabase.from("short_links").insert({
      user_id: user?.id ?? null,
      slug: finalSlug,
      original_url: parsedUrl.normalized,
    });

    if (!error) {
      const origin = request.nextUrl.origin;

      return NextResponse.json(
        { slug: finalSlug, shortUrl: `${origin}/s/${finalSlug}` },
        { status: 201 },
      );
    }

    console.error("[short-links] insert error:", JSON.stringify(error));

    if (error.code === "23505") {
      // Custom slug collision — tell the user immediately
      if (isCustomSlug) {
        return NextResponse.json({ error: "This slug is already taken. Choose a different one." }, { status: 409 });
      }

      // Auto-generated slug collision — retry with a new slug
      if (attempt < MAX_RETRIES) {
        finalSlug = generateSlug();
        continue;
      }

      return NextResponse.json(
        { error: "Could not generate a unique slug after multiple attempts. Please try again." },
        { status: 500 },
      );
    }

    // RLS violation or permission error
    if (error.code === "42501" || error.message?.includes("policy")) {
      return NextResponse.json({ error: "Permission denied. Check RLS policies." }, { status: 403 });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fallback — should not reach here
  return NextResponse.json(
    { error: "Could not generate a unique slug after multiple attempts. Please try again." },
    { status: 500 },
  );
}
