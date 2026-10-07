import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/site-content-schema";

type ProjectCardProps = { project: Project; index: number; featured?: boolean };

export function ProjectCard({ project, index, featured = false }: ProjectCardProps) {
  return (
    <article className={`project-card${featured ? " project-card--featured" : ""}`} data-sonic="true">
      <Link className="project-card__link" href={`/projects/${project.slug}`} aria-label={`View ${project.title} project`}>
        <div className="project-card__visual" style={{ "--project-accent": project.accent } as React.CSSProperties}>
          <Image
            src={project.cover}
            alt={`${project.title} — ${project.category} portfolio artwork`}
            fill
            sizes={featured ? "(max-width: 760px) 100vw, 65vw" : "(max-width: 760px) 100vw, 40vw"}
            className="project-card__image"
          />
          <span className="project-card__index">{String(index + 1).padStart(2, "0")} <span>/</span> {String(project.year).slice(-2)}</span>
          <span className="project-card__open" aria-hidden="true"><ArrowUpRight size={21} /></span>
          <span className="project-card__frame" aria-hidden="true" />
        </div>
        <div className="project-card__meta">
          <div><p className="project-card__category">{project.category}</p><h3>{project.title}</h3></div>
          <span className="project-card__year">{project.year}</span>
        </div>
        <p className="project-card__summary">{project.summary}</p>
      </Link>
    </article>
  );
}
