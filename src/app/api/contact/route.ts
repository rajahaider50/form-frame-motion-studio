import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { saveInquiry, consumeContactAttempt } from "@/lib/storage";
import { cleanInquiry, InquiryRequestSchema } from "@/lib/validation";
import { apiError, apiSuccess, readRequestJson, storageFailureMessage } from "@/lib/http";
import { isSameOrigin, requestBucket } from "@/lib/security";
import type { Inquiry } from "@/lib/site-content-schema";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return apiError(403, "This request could not be verified.");

  let attemptCount: number;
  try {
    attemptCount = await consumeContactAttempt(requestBucket(request));
  } catch {
    return apiError(503, storageFailureMessage());
  }
  if (attemptCount > 6) return apiError(429, "Too many messages from this connection. Please try again in a minute.");

  const body = await readRequestJson(request, 12_000);
  if (!body || typeof body !== "object") return apiError(400, "Please check the form and try again.");
  const parsed = InquiryRequestSchema.safeParse(body);
  if (!parsed.success) return apiError(422, "Please enter a valid email and a message of at least 10 characters.");
  if (parsed.data.website) return apiSuccess({ ok: true }, 202);

  const fields = cleanInquiry(parsed.data);
  const inquiry: Inquiry = {
    ...fields,
    website: "",
    id: randomUUID(),
    status: "new",
    createdAt: new Date().toISOString(),
  };
  try {
    await saveInquiry(inquiry);
    return apiSuccess({ ok: true, message: "Your note is with us. We’ll be in touch soon." }, 201);
  } catch {
    return apiError(503, storageFailureMessage());
  }
}
