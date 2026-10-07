import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getSiteContent } from "@/lib/content-store";
import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Start a conversation" };

export default async function ContactPage() {
  const content = await getSiteContent();
  return (
    <main>
      <section className="container page-intro"><div className="page-intro__layout"><Reveal><p className="eyebrow"><span className="status-dot" />A first frame, not a formal brief</p><h1>Good things<br /><span>start somewhere.</span></h1></Reveal><Reveal delay={0.1}><p className="page-intro__detail">Bring the ambition, the open question, or the thing that almost has a shape. We&apos;re happy to meet you there.</p></Reveal></div></section>
      <section className="section container section--topline"><div className="contact-split">
        <Reveal className="contact-aside"><p className="eyebrow"><span className="eyebrow-mark" />A line stays open</p><h2>Just enough<br /><span>to begin.</span></h2><p className="contact-aside__copy">A few sentences are plenty. A real person from the studio will reply, usually within two working days.</p>
          <div className="contact-detail"><span className="contact-detail__label">Write something down</span><a href={`mailto:${content.brand.email}`}>{content.brand.email}<ArrowUpRight size={13} aria-hidden="true" /></a></div>
          <div className="contact-detail"><span className="contact-detail__label">Call or WhatsApp</span><a href={`tel:${content.brand.phone.replace(/[^+\d]/g, "")}`}>{content.brand.phone}</a></div>
          <div className="contact-detail"><span className="contact-detail__label">Somewhere in the world</span><span>{content.brand.location}</span></div>
        </Reveal>
        <Reveal delay={0.12}><ContactForm services={content.services} /></Reveal>
      </div></section>
    </main>
  );
}
