import type { NextRequest } from "next/server";
import { apiError, apiSuccess, storageFailureMessage } from "@/lib/http";
import { consumeLoginAttempt } from "@/lib/storage";
import { createOAuthState, isOAuthAdminConfigured, isSameOrigin, requestBucket } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return apiError(403, "This request could not be verified.");
  if (!isOAuthAdminConfigured()) {
    return apiError(503, "Admin sign-in is not configured. Set the Manus OAuth details, an allowed administrator identity, and the session secret first.");
  }
  let attempts: number;
  try {
    attempts = await consumeLoginAttempt(requestBucket(request));
  } catch {
    return apiError(503, storageFailureMessage());
  }
  if (attempts > 12) return apiError(429, "Too many sign-in attempts. Please wait ten minutes before trying again.");
  try {
    const originHeader = request.headers.get("origin");
    if (!originHeader) return apiError(400, "The sign-in origin could not be verified.");
    const publicOrigin = new URL(originHeader);
    const callbackUri = new URL("/api/admin/oauth/callback", publicOrigin).toString();
    const portalValue = process.env.MANUS_OAUTH_PORTAL_URL;
    const projectId = process.env.MANUS_PROJECT_ID;
    if (!portalValue || !projectId) return apiError(503, "The Manus sign-in service is not configured.");
    const portalBase = new URL(portalValue);
    if (portalBase.protocol !== "https:") return apiError(503, "The configured Manus sign-in portal must use HTTPS.");
    const authUrl = new URL("/app-auth", portalBase);
    const authState = createOAuthState(callbackUri);
    authUrl.searchParams.set("appId", projectId);
    authUrl.searchParams.set("redirectUri", callbackUri);
    authUrl.searchParams.set("state", authState.state);
    authUrl.searchParams.set("responseType", "code");
    const response = apiSuccess({ url: authUrl.toString() });
    response.headers.append("Set-Cookie", authState.cookie);
    return response;
  } catch {
    return apiError(503, "The Manus sign-in configuration could not be used.");
  }
}
