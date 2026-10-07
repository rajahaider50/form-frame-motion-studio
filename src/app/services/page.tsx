import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, MoveRight } from "lucide-react";
import { getSiteContent } from "@/lib/content-store";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage() {
  const content = await getSiteContent();
  return (
    <main>
      <section className="container page-intro"><div className="page-intro__layout"><Reveal><p className="eyebrow"><span className="eyebrow-mark" />A little range. A lot of intention.</p><h1>Make it mean<br /><span>something.</span></h1></Reveal><Reveal delay={0.1}><p className="page-intro__detail">We build every project around the story it needs to tell. The right service is the one that makes the feeling come through.</p></Reveal></div></section>
      <section className="section container section--topline" aria-label="Studio services">
        <div className="service-list">
          {content.services.map((service, index) => <Reveal key={service.id} delay={index * 0.035}><article className="service-detail-row"><div className="service-detail-row__top"><span>{service.number} / 0{content.services.length}</span><span className="service-detail-row__arrow" aria-hidden="true"><MoveRight size={17} /></span></div><h2>{service.title}</h2><p className="service-detail-row__lead">{service.description}</p><div className="service-detail-row__bottom"><p>{service.detail}</p><div className="service-tags">{service.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></div></article></Reveal>)}
        </div>
      </section>
      <section className="section container section--topline"><Reveal className="service-note"><div><p className="eyebrow">Have a specific shape in mind?</p><h2>Tell us what you&apos;re trying to make possible.</h2></div><Link className="button button--primary" href="/contact">Let&apos;s find the form <ArrowUpRight size={16} /></Link></Reveal></section>
    </main>
  );
}
