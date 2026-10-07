import type { NextRequest } from "next/server";
import { createAdminSessionCookie, clearOAuthStateCookie, isAdminIdentityAllowed, isOAuthAdminConfigured, readAndValidateOAuthState } from "@/lib/security";

type TokenResponse = { accessToken?: string; tokenType?: string };
type UserInfoResponse = { openId?: string; email?: string; name?: string };

export const runtime = "nodejs";

function redirectToConsole(status: "access-denied" | "failed" | "not-allowed" | "cancelled") {
  return new Response(null, {
    status: 303,
    headers: { Location: `/atelier/console?auth=${status}`, "Cache-Control": "no-store" },
  });
}

function appendStateCookie(response: Response, callbackProtocol: string): Response {
  response.headers.append("Set-Cookie", clearOAuthStateCookie(callbackProtocol));
  return response;
}

export async function GET(request: NextRequest) {
  const callbackUrl = new URL(request.url);
  const state = readAndValidateOAuthState(request, callbackUrl.searchParams.get("state"));
  if (!state) return new Response("The sign-in request expired or could not be verified. Please try again.", { status: 400, headers: { "Cache-Control": "no-store" } });
  const protocol = new URL(state.redirectUri).protocol;
  const oauthError = callbackUrl.searchParams.get("error");
  if (oauthError) return appendStateCookie(redirectToConsole(oauthError === "access_denied" ? "cancelled" : "failed"), protocol);
  const code = callbackUrl.searchParams.get("code");
  if (!code || code.length > 4_096 || !isOAuthAdminConfigured()) return appendStateCookie(redirectToConsole("failed"), protocol);

  try {
    const apiEndpoint = process.env.MANUS_OAUTH_API_URL;
    const projectId = process.env.MANUS_PROJECT_ID;
    if (!apiEndpoint || !projectId) return appendStateCookie(redirectToConsole("failed"), protocol);
    const apiUrl = new URL(apiEndpoint);
    if (apiUrl.protocol !== "https:" && !(apiUrl.protocol === "http:" && ["localhost", "127.0.0.1"].includes(apiUrl.hostname))) return appendStateCookie(redirectToConsole("failed"), protocol);
    const apiBase = apiUrl.toString().replace(/\/$/, "");
    const clientId = projectId;
    const tokenResponse = await fetch(`${apiBase}/webdev.v1.WebDevAuthPublicService/ExchangeToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, grantType: "authorization_code", code, redirectUri: state.redirectUri }),
      cache: "no-store",
    });
    if (!tokenResponse.ok) return appendStateCookie(redirectToConsole("failed"), protocol);
    const tokenData = await tokenResponse.json() as TokenResponse;
    if (!tokenData.accessToken) return appendStateCookie(redirectToConsole("failed"), protocol);

    const userResponse = await fetch(`${apiBase}/webdev.v1.WebDevAuthPublicService/GetUserInfo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: tokenData.accessToken }),
      cache: "no-store",
    });
    if (!userResponse.ok) return appendStateCookie(redirectToConsole("failed"), protocol);
    const user = await userResponse.json() as UserInfoResponse;
    const email = user.email?.trim().toLowerCase() ?? "";
    const providerOpenId = user.openId?.trim() ?? "";
    if (!isAdminIdentityAllowed({ openId: providerOpenId, email })) return appendStateCookie(redirectToConsole("not-allowed"), protocol);
    const identity = { openId: providerOpenId || `email:${email}`, email };

    const response = new Response(null, {
      status: 303,
      headers: { Location: "/atelier/console", "Cache-Control": "no-store" },
    });
    response.headers.append("Set-Cookie", createAdminSessionCookie(identity, new URL(state.redirectUri).origin));
    response.headers.append("Set-Cookie", clearOAuthStateCookie(protocol));
    return response;
  } catch {
    return appendStateCookie(redirectToConsole("failed"), protocol);
  }
}
