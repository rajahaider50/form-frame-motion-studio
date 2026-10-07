import type { NextRequest } from "next/server";
import { getSiteContent, updateSiteContent } from "@/lib/content-store";
import { apiError, apiSuccess, readRequestJson, storageFailureMessage } from "@/lib/http";
import { hasAdminSession, isSameOrigin } from "@/lib/security";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!hasAdminSession(request)) return apiError(401, "Sign in to manage the studio site.");
  try {
    return apiSuccess({ content: await getSiteContent() });
  } catch {
    return apiError(503, storageFailureMessage());
  }
}

export async function PATCH(request: NextRequest) {
  if (!hasAdminSession(request)) return apiError(401, "Sign in to manage the studio site.");
  if (!isSameOrigin(request)) return apiError(403, "This request could not be verified.");
  const body = await readRequestJson(request, 80_000);
  if (!body || typeof body !== "object" || !("content" in body)) {
    return apiError(400, "The submitted site content could not be read.");
  }
  try {
    const content = await updateSiteContent((body as { content: unknown }).content);
    return apiSuccess({ ok: true, content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The site content could not be saved.";
    if (message.includes("Persistent storage") || message.includes("storage service")) {
      return apiError(503, storageFailureMessage());
    }
    return apiError(422, message);
  }
}
