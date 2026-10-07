import type { NextRequest } from "next/server";
import { changeInquiryStatus, listInquiries } from "@/lib/storage";
import { apiError, apiSuccess, readRequestJson, storageFailureMessage } from "@/lib/http";
import { hasAdminSession, isSameOrigin } from "@/lib/security";
import { InquiryStatusSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!hasAdminSession(request)) return apiError(401, "Sign in to view studio inquiries.");
  try {
    const messages = await listInquiries();
    return apiSuccess({ messages });
  } catch {
    return apiError(503, storageFailureMessage());
  }
}

export async function PATCH(request: NextRequest) {
  if (!hasAdminSession(request)) return apiError(401, "Sign in to manage studio inquiries.");
  if (!isSameOrigin(request)) return apiError(403, "This request could not be verified.");
  const body = await readRequestJson(request, 4_000);
  const parsed = InquiryStatusSchema.safeParse(body);
  if (!parsed.success) return apiError(422, "Choose a valid inquiry status.");
  try {
    const message = await changeInquiryStatus(parsed.data.id, parsed.data.status);
    if (!message) return apiError(404, "That inquiry is no longer available.");
    return apiSuccess({ ok: true, message });
  } catch {
    return apiError(503, storageFailureMessage());
  }
}
