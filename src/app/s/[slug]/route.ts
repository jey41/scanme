import { NextRequest, NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!hasSupabaseEnv()) {
    return new NextResponse("Service unavailable", { status: 503 });
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return new NextResponse("Service unavailable", { status: 503 });
  }

  const { data, error } = await supabase
    .from("short_links")
    .select("original_url")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return new NextResponse("Short link not found", { status: 404 });
  }

  return NextResponse.redirect(data.original_url, 302);
}
