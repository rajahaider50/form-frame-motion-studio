import { z } from "zod";
import { InquirySchema, type InquiryInput } from "@/lib/site-content-schema";

export const InquiryRequestSchema = InquirySchema;

export const InquiryStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "reviewing", "replied"]),
});

export function cleanInquiry(input: InquiryInput): Omit<InquiryInput, "website"> {
  return {
    name: input.name.replace(/[<>]/g, "").trim(),
    email: input.email.toLowerCase().trim(),
    company: input.company.replace(/[<>]/g, "").trim(),
    service: input.service.replace(/[<>]/g, "").trim(),
    message: input.message.replace(/[<>]/g, "").trim(),
  };
}

export function isSafeCoverPath(value: string): boolean {
  return (
    value.startsWith("/images/") &&
    !value.includes("..") &&
    !value.includes("\\") &&
    !value.includes("?") &&
    /\.(svg|png|jpe?g|webp)$/i.test(value)
  );
}
