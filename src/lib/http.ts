import { NextResponse } from "next/server";

export function apiError(status: number, message: string) {
  return NextResponse.json({ error: message }, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function readRequestJson(request: Request, maximumBytes = 24_000): Promise<unknown | null> {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > maximumBytes) return null;
  const raw = await request.text();
  if (!raw || Buffer.byteLength(raw, "utf8") > maximumBytes) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function storageFailureMessage(): string {
  return "Persistent storage is not configured or temporarily unavailable. Contact the studio directly while the site owner completes setup.";
}
