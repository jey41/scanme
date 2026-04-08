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
  let finalSlug: string;

  if (body.slug && typeof body.slug === "string" && body.slug.trim()) {
    const parsedSlug = validateSlug(body.slug);

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

  const { error } = await supabase.from("short_links").insert({
    user_id: user?.id ?? null,
    slug: finalSlug,
    original_url: parsedUrl.normalized,
  });

  if (error) {
    console.error("[short-links] insert error:", JSON.stringify(error));

    if (error.code === "23505") {
      return NextResponse.json({ error: "This slug is already taken. Choose a different one." }, { status: 409 });
    }

    // RLS violation or permission error
    if (error.code === "42501" || error.message?.includes("policy")) {
      return NextResponse.json({ error: "Permission denied. Check RLS policies." }, { status: 403 });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const origin = request.nextUrl.origin;

  return NextResponse.json(
    { slug: finalSlug, shortUrl: `${origin}/s/${finalSlug}` },
    { status: 201 },
  );
}
