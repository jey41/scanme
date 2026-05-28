import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/env";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = url.searchParams.get("next") ?? "/tool/history";

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.search = "";

  if (!hasSupabaseEnv()) {
    return NextResponse.redirect(redirectTo);
  }

  const { url: supabaseUrl, anonKey } = getSupabaseEnv();
  const response = NextResponse.redirect(redirectTo);

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        // Propagate anti-cache headers emitted by @supabase/ssr so that
        // CDNs / reverse-proxies never serve another user's session cookie.
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  // ---------------------------------------------------------------------------
  // OAuth PKCE flow (Google, GitHub, etc.)
  // Supabase redirects here with ?code=<auth_code>&next=<redirect_path>
  // ---------------------------------------------------------------------------
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return response;
    }

    console.error("[auth/confirm] code exchange failed:", error.message);
  }

  // ---------------------------------------------------------------------------
  // Email OTP / Magic-link flow
  // Supabase redirects here with ?token_hash=<hash>&type=<otp_type>&next=...
  // ---------------------------------------------------------------------------
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      return response;
    }

    console.error("[auth/confirm] OTP verification failed:", error.message);
  }

  // Neither flow succeeded — redirect to login as fallback
  const fallbackLocale = next.startsWith("/en") ? "en" : "id";

  return NextResponse.redirect(new URL(`/${fallbackLocale}/login`, request.url));
}
