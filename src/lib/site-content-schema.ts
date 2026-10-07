import { z } from "zod";

const text = (maximum: number) => z.string().trim().min(1).max(maximum);

export const ProjectSchema = z.object({
  slug: z.string().trim().min(2).max(72).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: text(90),
  category: text(80),
  year: z.string().trim().regex(/^(19|20|21)\d{2}$/),
  summary: text(240),
  description: text(1600),
  client: text(90),
  role: text(180),
  cover: z.string().trim().regex(/^\/images\/[a-zA-Z0-9._-]+\.(svg|png|jpe?g|webp)$/i),
  accent: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/),
  deliverables: z.array(text(90)).max(12),
});

export const ServiceSchema = z.object({
  id: z.string().trim().min(2).max(48).regex(/^[a-z0-9-]+$/),
  number: z.string().trim().regex(/^\d{2}$/),
  title: text(90),
  description: text(500),
  detail: text(1000),
  tags: z.array(text(60)).max(8),
});

export const ProcessStepSchema = z.object({
  id: z.string().trim().min(2).max(48).regex(/^[a-z0-9-]+$/),
  title: text(70),
  description: text(400),
});

export const SiteContentSchema = z.object({
  brand: z.object({
    name: text(50),
    descriptor: text(100),
    email: z.string().trim().email().max(160),
    phone: text(48),
    location: text(100),
    seoTitle: text(90),
    seoDescription: text(240),
    instagramUrl: z.string().trim().url().max(300),
  }),
  hero: z.object({
    eyebrow: text(100),
    title: text(140),
    highlight: text(100),
    body: text(600),
    cta: text(60),
    secondaryCta: text(60),
    projectCount: text(24),
  }),
  about: z.object({
    eyebrow: text(100),
    title: text(180),
    intro: text(500),
    body: text(1800),
    closing: text(600),
    statement: text(300),
    ctaTitle: text(180),
    ctaButton: text(60),
    years: text(16),
    collaborators: text(16),
    timeZones: text(16),
    milestones: z.array(z.object({
      year: z.string().trim().regex(/^(19|20|21)\d{2}$/),
      title: text(90),
      description: text(500),
    })).min(2).max(8),
  }),
  services: z.array(ServiceSchema).min(1).max(12),
  projects: z.array(ProjectSchema).min(1).max(24),
  process: z.array(ProcessStepSchema).min(2).max(8),
});

export type SiteContent = z.infer<typeof SiteContentSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type InquiryStatus = "new" | "reviewing" | "replied";

export const InquirySchema = z.object({
  name: text(90),
  email: z.string().trim().email().max(160),
  company: z.string().trim().max(120).default(""),
  service: text(100),
  message: text(2000).min(10),
  website: z.string().max(200).optional().default(""),
});

export type InquiryInput = z.infer<typeof InquirySchema>;

export type Inquiry = InquiryInput & {
  id: string;
  status: InquiryStatus;
  createdAt: string;
};
