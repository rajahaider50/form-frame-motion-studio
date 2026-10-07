import { defaultContent } from "@/lib/default-content";
import { SiteContentSchema, type SiteContent } from "@/lib/site-content-schema";
import { readContent, saveContent } from "@/lib/storage";
import { isSafeCoverPath } from "@/lib/validation";

export async function getSiteContent(): Promise<SiteContent> {
  let candidate: SiteContent;
  try {
    candidate = await readContent(defaultContent);
  } catch (error) {
    if (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") {
      const hasUrl = Boolean(process.env.KV_REST_API_URL);
      const hasToken = Boolean(process.env.KV_REST_API_TOKEN);
      if (!hasUrl && !hasToken) return defaultContent;
    }
    throw error;
  }
  const parsed = SiteContentSchema.safeParse(candidate);
  if (!parsed.success) {
    console.error("Stored site content failed schema validation; using the built-in defaults.");
    return defaultContent;
  }
  return parsed.data;
}

export async function updateSiteContent(input: unknown): Promise<SiteContent> {
  const parsed = SiteContentSchema.safeParse(input);
  if (!parsed.success) throw new Error("The submitted site content is invalid.");
  const normalized = parsed.data;
  const projectSlugs = normalized.projects.map((project) => project.slug);
  if (new Set(projectSlugs).size !== projectSlugs.length) throw new Error("Project slugs must be unique.");
  const serviceIds = normalized.services.map((service) => service.id);
  if (new Set(serviceIds).size !== serviceIds.length) throw new Error("Service IDs must be unique.");
  if (normalized.projects.some((project) => !isSafeCoverPath(project.cover))) {
    throw new Error("Project covers must use a safe local /images/ path.");
  }
  await saveContent(normalized);
  return normalized;
}
