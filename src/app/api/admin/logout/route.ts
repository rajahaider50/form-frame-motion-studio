import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiError } from "@/lib/http";
import { clearAdminSessionCookie, isSameOrigin } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return apiError(403, "This request could not be verified.");
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.headers.append("Set-Cookie", clearAdminSessionCookie(request));
  return response;
}
