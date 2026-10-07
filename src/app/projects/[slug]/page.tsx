import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getSiteContent } from "@/lib/content-store";
import { ParallaxImage } from "@/components/parallax-image";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

type ProjectPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getSiteContent();
  const project = content.projects.find((item) => item.slug === slug);
  if (!project) return { title: "Project" };
  return { title: project.title, description: project.summary, openGraph: { title: project.title, description: project.summary, images: [project.cover] } };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const content = await getSiteContent();
  const project = content.projects.find((item) => item.slug === slug);
  if (!project) notFound();
  const projectIndex = content.projects.findIndex((item) => item.slug === project.slug);
  const previousProject = content.projects.length > 1 ? content.projects[(projectIndex - 1 + content.projects.length) % content.projects.length] : null;
  const nextProject = content.projects.length > 1 ? content.projects[(projectIndex + 1) % content.projects.length] : null;

  return (
    <main>
      <section className="container project-detail-page">
        <div className="project-detail-top"><Link className="text-link" href="/projects"><ArrowLeft size={15} />All work</Link><span className="eyebrow"><span className="eyebrow-mark" />{project.year} / Selected project</span></div>
        <Reveal className="detail-hero"><ParallaxImage src={project.cover} alt={`${project.title} project artwork`} priority sizes="(max-width: 760px) 100vw, 92vw" /><div className="project-detail-title"><p className="eyebrow">{project.category}</p><h1>{project.title}</h1></div></Reveal>
        <div className="project-detail-meta">
          <div className="project-detail-meta__cell"><span>Client</span><span>{project.client}</span></div>
          <div className="project-detail-meta__cell"><span>Year</span><span>{project.year}</span></div>
          <div className="project-detail-meta__cell"><span>Scope</span><span>{project.category}</span></div>
          <div className="project-detail-meta__cell"><span>Studio role</span><span>{project.role}</span></div>
        </div>
        <Reveal className="project-story"><div><p className="eyebrow"><span className="eyebrow-mark" />The thought behind it</p><h2>{project.summary}</h2></div><div><p>{project.description}</p><div className="project-story__tags">{project.deliverables.map((item) => <span className="tag" key={item}>{item}</span>)}</div><Link className="text-link" href="/contact">Make something with us <ArrowUpRight size={15} /></Link></div></Reveal>
        {previousProject && nextProject ? <nav className="project-neighbors" aria-label="Browse other projects">
          <Link className="project-neighbor" href={`/projects/${previousProject.slug}`}><span className="eyebrow"><ArrowLeft size={13} />Previous project</span><strong>{previousProject.title}</strong></Link>
          <Link className="project-neighbor project-neighbor--next" href={`/projects/${nextProject.slug}`}><span className="eyebrow">Next project <ArrowRight size={13} /></span><strong>{nextProject.title}</strong></Link>
        </nav> : null}
        <div className="section-action"><Link className="button button--outline" href="/projects"><ArrowLeft size={15} />Back to selected work</Link></div>
      </section>
    </main>
  );
}
