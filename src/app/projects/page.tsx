import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content-store";
import { Reveal } from "@/components/reveal";
import { ProjectGallery } from "@/components/project-gallery";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Selected work" };

export default async function ProjectsPage() {
  const content = await getSiteContent();
  return (
    <main>
      <section className="container page-intro"><div className="page-intro__layout"><Reveal><p className="eyebrow"><span className="eyebrow-mark" />A collection, not a greatest-hits reel</p><h1>Recent work.<br /><span>Lasting feeling.</span></h1></Reveal><Reveal delay={0.1}><p className="page-intro__detail">Different briefs, different worlds, and one question that stays the same: what should someone carry with them when it&apos;s over?</p></Reveal></div></section>
      <section className="section container section--topline"><ProjectGallery projects={content.projects} /></section>
    </main>
  );
}
