import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Play } from "lucide-react";
import { getSiteContent } from "@/lib/content-store";
import { CountUp } from "@/components/count-up";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "About the studio" };

export default async function AboutPage() {
  const content = await getSiteContent();
  return (
    <main>
      <section className="container page-intro">
        <div className="page-intro__layout">
          <Reveal><p className="eyebrow"><span className="eyebrow-mark" />{content.about.eyebrow}</p><h1>{content.about.title}</h1></Reveal>
          <Reveal delay={0.1}><p className="page-intro__detail">{content.about.intro}</p></Reveal>
        </div>
      </section>
      <section className="container about-stage" aria-label="Studio manifesto">
        <Reveal className="about-stage__art">
          <div className="about-stage__glass" aria-hidden="true"><span /><i /><b /></div>
          <div className="about-stage__caption"><span className="eyebrow">Motion is a material</span><span className="about-stage__play"><Play size={14} fill="currentColor" /></span></div>
          <span className="about-stage__coordinates" aria-hidden="true">FF—01 / 24</span>
        </Reveal>
        <Reveal className="about-stage__copy" delay={0.12}>
          <span className="eyebrow">A studio for the in-between</span>
          <p className="about-stage__quote">“{content.about.statement}”</p>
          <p>{content.about.body}</p>
          <p>{content.about.closing}</p>
          <Link className="text-link" href="/contact">Come meet the team <ArrowUpRight size={15} /></Link>
        </Reveal>
      </section>
      <section className="section container section--topline">
        <Reveal><SectionHeading eyebrow="Small milestones, long curiosity" title="A practice that keeps finding a new frame." detail="A few moments in the story so far—and an open space for the next one." /></Reveal>
        <div className="about-timeline">
          {content.about.milestones.map((milestone, index) => <Reveal key={`${milestone.year}-${milestone.title}`} delay={index * 0.06} className="about-timeline__item"><time dateTime={milestone.year}>{milestone.year}</time><span className="about-timeline__node" aria-hidden="true" /><div><h3>{milestone.title}</h3><p>{milestone.description}</p></div></Reveal>)}
        </div>
      </section>
      <section className="section container section--topline">
        <Reveal><SectionHeading eyebrow="Little numbers, bigger intent" title="Independently minded. Open by design." detail="A flexible network of senior creatives that finds the right shape for every story." /></Reveal>
        <div className="about-metrics">
          {[
            [content.about.years, "Years making things move"],
            [content.about.collaborators, "Independent collaborators"],
            [content.about.timeZones, "Time zones we call home"],
          ].map(([value, label], index) => <Reveal key={label} delay={index * 0.08} className="about-metric"><span>{String(index + 1).padStart(2, "0")}</span><CountUp value={value} /><p>{label}</p></Reveal>)}
        </div>
      </section>
      <section className="section container section--topline">
        <Reveal className="contact-cta-strip"><p className="eyebrow"><span className="status-dot" />Put a point of view in motion</p><h2>{content.about.ctaTitle}</h2><Link className="button button--primary" href="/contact">{content.about.ctaButton} <ArrowUpRight size={16} /></Link></Reveal>
      </section>
    </main>
  );
}
