import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import { getSiteContent } from "@/lib/content-store";
import { Reveal, StaggerList } from "@/components/reveal";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getSiteContent();
  const featured = content.projects.slice(0, 3);
  return (
    <main>
      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero__art" aria-hidden="true">
          <Image src="/images/hero-motion-studio.svg" alt="" fill priority sizes="(max-width: 760px) 125vw, 90vw" />
        </div>
        <div className="hero__content">
          <Reveal y={18}>
            <p className="eyebrow"><span className="status-dot" />{content.hero.eyebrow}</p>
            <h1 id="hero-title">{content.hero.title}<span>{content.hero.highlight}</span></h1>
            <p className="hero__body">{content.hero.body}</p>
            <div className="hero__actions">
              <Link className="button button--primary" href="/contact" data-sonic="true">{content.hero.cta}<ArrowUpRight size={17} aria-hidden="true" /></Link>
              <Link className="button button--outline" href="/projects" data-sonic="true">{content.hero.secondaryCta}<ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
            <div className="hero__foot"><span className="hero__foot-rule" />{content.hero.projectCount} stories and counting <ArrowDown size={12} aria-hidden="true" /></div>
          </Reveal>
        </div>
        <div className="hero__side-index" aria-hidden="true">Scroll to feel something</div>
        <div className="hero__coordinates" aria-hidden="true"><span>37° 46&apos; N</span><span>Frame 01—24</span><span>Volume I</span></div>
      </section>

      <section className="section container section--topline" aria-labelledby="intro-title">
        <Reveal className="intro-band">
          <p className="intro-band__quote" id="intro-title">We make work that <span>moves beyond the screen.</span></p>
          <div className="intro-band__copy">
            <p>{content.about.body}</p>
            <div className="stat-line">
              <div className="stat-line__item"><span className="stat-line__value">{content.about.years}<sup>+</sup></span><span className="stat-line__label">Years in motion</span></div>
              <div className="stat-line__item"><span className="stat-line__value">{content.about.collaborators}</span><span className="stat-line__label">Creative partners</span></div>
              <div className="stat-line__item"><span className="stat-line__value">{content.about.timeZones}</span><span className="stat-line__label">Time zones</span></div>
            </div>
            <Link className="text-link" href="/about">A little more about us <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
        </Reveal>
      </section>

      <section className="section container" aria-labelledby="services-title">
        <Reveal><SectionHeading eyebrow="What we bring to the frame" title="A good idea deserves a world of its own." detail="One close-knit team, from the first spark of a brief to the last note in the mix." /></Reveal>
        <StaggerList className="service-list">
          {content.services.map((service) => (
            <Reveal key={service.id}>
              <Link className="service-row" href="/services" data-sonic="true">
                <span className="service-row__number">{service.number}</span>
                <div><h3>{service.title}</h3><div className="service-tags">{service.tags.slice(0, 3).map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></div>
                <p className="service-row__description">{service.description}</p>
                <span className="service-row__arrow" aria-hidden="true"><ArrowUpRight size={18} /></span>
              </Link>
            </Reveal>
          ))}
        </StaggerList>
        <div className="section-action"><Link className="text-link" href="/services">Explore the whole toolkit <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
      </section>

      <section className="section container section--topline" aria-labelledby="work-title">
        <Reveal><SectionHeading eyebrow="A few recent frames" title="A little more than eye candy." detail="A selection of films, identities, and worlds built with people we like to work with." /></Reveal>
        <div className="project-grid" id="work-title">
          {featured.map((project, index) => <Reveal key={project.slug} delay={index * 0.07}><ProjectCard project={project} index={index} featured={index === 0} /></Reveal>)}
        </div>
        <div className="section-action"><Link className="button button--outline" href="/projects">View the full collection <ArrowRight size={15} aria-hidden="true" /></Link></div>
      </section>

      <section className="section container section--topline" aria-labelledby="process-title">
        <Reveal><SectionHeading eyebrow="A clear path through the fog" title="Thoughtful from first thought to final frame." detail="Small teams, good questions, and a process with enough structure to leave room for surprise." /></Reveal>
        <div className="process-list" id="process-title">
          {content.process.map((step, index) => (
            <Reveal key={step.id} delay={index * 0.07} className="process-card">
              <span className="process-card__number">{String(index + 1).padStart(2, "0")}<Plus size={11} aria-hidden="true" /></span>
              <h3>{step.title}</h3><p>{step.description}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section container section--topline" aria-label="Start a project">
        <Reveal className="contact-cta-strip">
          <p className="eyebrow"><span className="status-dot" />A good place to start</p>
          <h2>Tell us the part<br /><span>you can&apos;t stop thinking about.</span></h2>
          <Link className="button button--primary" href="/contact" data-sonic="true">Bring us the first frame <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </Reveal>
      </section>
    </main>
  );
}
