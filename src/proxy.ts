import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith("/auth/") ||
    request.nextUrl.pathname.startsWith("/s/") ||
    request.nextUrl.pathname.startsWith("/api/")
  ) {
    const passthrough = NextResponse.next({ request });
    return updateSession(request, passthrough);
  }

  const response = handleI18nRouting(request);

  return updateSession(request, response);
}

export const config = {
  matcher: "/((?!trpc|_next|_vercel|.*\\..*).*)",
};
