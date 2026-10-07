import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Inquiry, InquiryStatus, SiteContent } from "@/lib/site-content-schema";

const CONTENT_KEY = "formframe:site-content:v1";
const INQUIRY_INDEX = "formframe:inquiries:index:v1";
const INQUIRY_PREFIX = "formframe:inquiry:v1:";
const MAX_INQUIRIES = 500;

type StorageMode = "redis" | "local";

function storageMode(): StorageMode {
  const hasUrl = Boolean(process.env.KV_REST_API_URL);
  const hasToken = Boolean(process.env.KV_REST_API_TOKEN);
  if (hasUrl && hasToken) return "redis";
  if (hasUrl !== hasToken) throw new Error("Cloud storage is only partially configured.");
  if (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") {
    throw new Error("Configure KV_REST_API_URL and KV_REST_API_TOKEN for persistent cloud storage.");
  }
  return "local";
}

async function redisCommand<T>(command: Array<string | number>): Promise<T> {
  const endpoint = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!endpoint || !token) throw new Error("Cloud storage is not configured.");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("The persistent storage service could not be reached.");
  const payload = (await response.json()) as { result?: T; error?: string };
  if (payload.error) throw new Error("The persistent storage service rejected a request.");
  return payload.result as T;
}

function dataPath(filename: string): string {
  return path.join(process.cwd(), "data", filename);
}

async function readJson<T>(filename: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(dataPath(filename), "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson<T>(filename: string, data: T): Promise<void> {
  const folder = path.dirname(dataPath(filename));
  await mkdir(folder, { recursive: true });
  const tempPath = `${dataPath(filename)}.${process.pid}.tmp`;
  await writeFile(tempPath, JSON.stringify(data, null, 2), { encoding: "utf8", mode: 0o600 });
  await rename(tempPath, dataPath(filename));
}

export async function readContent(fallback: SiteContent): Promise<SiteContent> {
  if (storageMode() === "redis") {
    const value = await redisCommand<string | null>(["GET", CONTENT_KEY]);
    return value ? (JSON.parse(value) as SiteContent) : fallback;
  }
  return readJson("site-content.json", fallback);
}

export async function saveContent(value: SiteContent): Promise<void> {
  if (storageMode() === "redis") {
    await redisCommand(["SET", CONTENT_KEY, JSON.stringify(value)]);
    return;
  }
  await writeJson("site-content.json", value);
}

export async function saveInquiry(inquiry: Inquiry): Promise<void> {
  if (storageMode() === "redis") {
    await redisCommand(["SET", `${INQUIRY_PREFIX}${inquiry.id}`, JSON.stringify(inquiry)]);
    await redisCommand(["LPUSH", INQUIRY_INDEX, inquiry.id]);
    await redisCommand(["LTRIM", INQUIRY_INDEX, 0, MAX_INQUIRIES - 1]);
    return;
  }
  const current = await readJson<Inquiry[]>("inquiries.json", []);
  await writeJson("inquiries.json", [inquiry, ...current].slice(0, MAX_INQUIRIES));
}

export async function listInquiries(): Promise<Inquiry[]> {
  if (storageMode() === "redis") {
    const ids = await redisCommand<string[]>(["LRANGE", INQUIRY_INDEX, 0, 99]);
    if (!ids?.length) return [];
    const result = await redisCommand<Array<string | null>>([
      "MGET",
      ...ids.map((id) => `${INQUIRY_PREFIX}${id}`),
    ]);
    return (result ?? []).flatMap((value) => (value ? [JSON.parse(value) as Inquiry] : []));
  }
  return readJson<Inquiry[]>("inquiries.json", []);
}

export async function changeInquiryStatus(id: string, status: InquiryStatus): Promise<Inquiry | null> {
  if (storageMode() === "redis") {
    const key = `${INQUIRY_PREFIX}${id}`;
    const current = await redisCommand<string | null>(["GET", key]);
    if (!current) return null;
    const updated = { ...(JSON.parse(current) as Inquiry), status };
    await redisCommand(["SET", key, JSON.stringify(updated)]);
    return updated;
  }
  const current = await readJson<Inquiry[]>("inquiries.json", []);
  const index = current.findIndex((item) => item.id === id);
  if (index < 0) return null;
  current[index] = { ...current[index], status };
  await writeJson("inquiries.json", current);
  return current[index];
}

export async function consumeLoginAttempt(bucket: string): Promise<number> {
  if (storageMode() === "redis") {
    const key = `formframe:login-attempts:${bucket}`;
    const count = await redisCommand<number>(["INCR", key]);
    if (count === 1) await redisCommand(["EXPIRE", key, 600]);
    return count;
  }
  const key = `login-attempts:${bucket}`;
  const now = Date.now();
  const previous = localAttempts.get(key);
  const next = previous && now - previous.startedAt < 600_000
    ? { startedAt: previous.startedAt, count: previous.count + 1 }
    : { startedAt: now, count: 1 };
  localAttempts.set(key, next);
  return next.count;
}

const localAttempts = new Map<string, { startedAt: number; count: number }>();

export async function consumeContactAttempt(bucket: string): Promise<number> {
  if (storageMode() === "redis") {
    const key = `formframe:contact-attempts:${bucket}`;
    const count = await redisCommand<number>(["INCR", key]);
    if (count === 1) await redisCommand(["EXPIRE", key, 60]);
    return count;
  }
  const key = `contact-attempts:${bucket}`;
  const now = Date.now();
  const previous = localContactAttempts.get(key);
  const next = previous && now - previous.startedAt < 60_000
    ? { startedAt: previous.startedAt, count: previous.count + 1 }
    : { startedAt: now, count: 1 };
  localContactAttempts.set(key, next);
  return next.count;
}

const localContactAttempts = new Map<string, { startedAt: number; count: number }>();
