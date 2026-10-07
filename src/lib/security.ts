import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "webdev_app_session";
const OAUTH_STATE_COOKIE = "ff_oauth_state";
const SESSION_SECONDS = 60 * 60 * 8;
const OAUTH_STATE_SECONDS = 60 * 10;

type AdminIdentity = { openId: string; email: string };
type SessionPayload = { sub: string; email: string; exp: number; nonce: string };
type OAuthState = { redirectUri: string; nonce: string; createdAt: number; signature: string };

function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("Configure ADMIN_SESSION_SECRET with at least 32 random characters.");
  return secret;
}

function safeEqual(left: Buffer, right: Buffer): boolean {
  return left.length === right.length && timingSafeEqual(left, right);
}

function hmac(value: string, secret = sessionSecret()): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function readCookie(request: Request, name: string): string | null {
  const entry = (request.headers.get("cookie") ?? "").split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return entry ? entry.slice(name.length + 1) : null;
}

function allowedSet(variable: string): Set<string> {
  return new Set((process.env[variable] ?? "").split(",").map((value) => value.trim()).filter(Boolean));
}

export function isAdminIdentityAllowed(identity: AdminIdentity): boolean {
  const openIds = allowedSet("ADMIN_ALLOWED_OPEN_IDS");
  const emails = new Set([...allowedSet("ADMIN_ALLOWED_EMAILS")].map((email) => email.toLowerCase()));
  return (Boolean(identity.openId) && openIds.has(identity.openId)) || (Boolean(identity.email) && emails.has(identity.email.trim().toLowerCase()));
}

export function isOAuthAdminConfigured(): boolean {
  return Boolean(
    process.env.MANUS_PROJECT_ID?.trim() &&
    process.env.MANUS_OAUTH_PORTAL_URL?.trim() &&
    process.env.MANUS_OAUTH_API_URL?.trim() &&
    process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32 &&
    (process.env.ADMIN_ALLOWED_OPEN_IDS?.trim() || process.env.ADMIN_ALLOWED_EMAILS?.trim()),
  );
}

function cookieSecurityAttributes(protocol: string): string {
  return `Path=/; HttpOnly; ${protocol === "https:" ? "Secure; SameSite=None" : "SameSite=Lax"}`;
}

export function createOAuthState(redirectUri: string): { state: string; nonce: string; cookie: string } {
  const nonce = randomBytes(32).toString("base64url");
  const unsigned = { redirectUri, nonce, createdAt: Date.now() };
  const signature = hmac(Buffer.from(JSON.stringify(unsigned)).toString("base64url"));
  const payload: OAuthState = { ...unsigned, signature };
  const state = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const protocol = new URL(redirectUri).protocol;
  const cookie = `${OAUTH_STATE_COOKIE}=${nonce}; ${cookieSecurityAttributes(protocol)}; Max-Age=${OAUTH_STATE_SECONDS}`;
  return { state, nonce, cookie };
}

export function clearOAuthStateCookie(protocol: string): string {
  return `${OAUTH_STATE_COOKIE}=; ${cookieSecurityAttributes(protocol)}; Max-Age=0`;
}

export function readAndValidateOAuthState(request: Request, stateValue: string | null): OAuthState | null {
  const cookieNonce = readCookie(request, OAUTH_STATE_COOKIE);
  if (!stateValue || !cookieNonce || stateValue.length > 4_096) return null;
  try {
    const decoded = JSON.parse(Buffer.from(stateValue, "base64url").toString("utf8")) as OAuthState;
    if (typeof decoded.nonce !== "string" || typeof decoded.redirectUri !== "string" || typeof decoded.createdAt !== "number" || typeof decoded.signature !== "string") return null;
    if (!safeEqual(Buffer.from(decoded.nonce), Buffer.from(cookieNonce))) return null;
    if (Date.now() - decoded.createdAt > OAUTH_STATE_SECONDS * 1_000 || decoded.createdAt > Date.now() + 30_000) return null;
    const { signature, ...unsigned } = decoded;
    const expectedSignature = hmac(Buffer.from(JSON.stringify(unsigned)).toString("base64url"));
    if (!safeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return null;
    const callback = new URL(decoded.redirectUri);
    if (callback.pathname !== "/api/admin/oauth/callback" || callback.search || callback.hash || callback.username || callback.password) return null;
    if (callback.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(callback.hostname)) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function createAdminSessionCookie(identity: AdminIdentity, publicOrigin: string): string {
  const payload: SessionPayload = {
    sub: identity.openId,
    email: identity.email.trim().toLowerCase(),
    exp: Math.floor(Date.now() / 1_000) + SESSION_SECONDS,
    nonce: randomBytes(16).toString("base64url"),
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = hmac(encoded);
  const protocol = new URL(publicOrigin).protocol;
  return `${SESSION_COOKIE}=${encoded}.${signature}; ${cookieSecurityAttributes(protocol)}; Max-Age=${SESSION_SECONDS}`;
}

export function clearAdminSessionCookie(request: Request): string {
  const origin = request.headers.get("origin");
  const protocol = origin ? new URL(origin).protocol.replace(":", "") : (request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "")).split(",")[0].trim();
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; ${protocol === "https" ? "Secure; SameSite=None" : "SameSite=Lax"}; Max-Age=0`;
}

function verifyOwnedSession(token: string): boolean {
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;
  const encoded = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  try {
    if (!safeEqual(Buffer.from(hmac(encoded)), Buffer.from(signature))) return false;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    return Boolean(payload.sub && payload.email && payload.exp > Math.floor(Date.now() / 1_000) && isAdminIdentityAllowed({ openId: payload.sub, email: payload.email }));
  } catch {
    return false;
  }
}

function verifyPreviewJwt(token: string): boolean {
  const secret = process.env.MANUS_JWT_SECRET;
  const projectId = process.env.MANUS_PROJECT_ID;
  if (!secret || !projectId) return false;
  const [encodedHeader, encodedPayload, signature, extra] = token.split(".");
  if (!encodedHeader || !encodedPayload || !signature || extra) return false;
  try {
    const header = JSON.parse(Buffer.from(encodedHeader, "base64url").toString("utf8")) as { alg?: string };
    if (header.alg !== "HS256") return false;
    const expected = Buffer.from(hmac(`${encodedHeader}.${encodedPayload}`, secret));
    if (!safeEqual(expected, Buffer.from(signature))) return false;
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as { appId?: string; openId?: string; email?: string; exp?: number };
    return payload.appId === projectId && typeof payload.openId === "string" && Number(payload.exp) > Math.floor(Date.now() / 1_000) && isAdminIdentityAllowed({ openId: payload.openId, email: payload.email ?? "" });
  } catch {
    return false;
  }
}

export function hasAdminSession(request: NextRequest | Request): boolean {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return false;
  if (verifyOwnedSession(token)) return true;
  return verifyPreviewJwt(token);
}

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host");
  if (!origin || !host) return false;
  try {
    const parsed = new URL(origin);
    const secureOrigin = parsed.protocol === "https:";
    const localHttpOrigin = parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname);
    const originIsAllowed = !parsed.username && !parsed.password && (secureOrigin || localHttpOrigin);
    if (!originIsAllowed) return false;
    if (parsed.host.toLowerCase() === host.toLowerCase()) return true;
    return secureOrigin && request.headers.get("sec-fetch-site") === "same-origin";
  } catch {
    return false;
  }
}

export function requestBucket(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || request.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(`formframe-rate-limit:${address}`).digest("hex").slice(0, 24);
}
