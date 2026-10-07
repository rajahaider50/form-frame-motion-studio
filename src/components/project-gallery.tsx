"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Project } from "@/lib/site-content-schema";
import { ProjectCard } from "@/components/project-card";

type ProjectGalleryProps = { projects: Project[] };

export function ProjectGallery({ projects }: ProjectGalleryProps) {
  const [active, setActive] = useState("All work");
  const reduceMotion = useReducedMotion();
  const categories = useMemo(() => ["All work", ...Array.from(new Set(projects.map((project) => project.category.split("·")[0].trim())))], [projects]);
  const visible = useMemo(() => active === "All work" ? projects : projects.filter((project) => project.category.startsWith(active)), [active, projects]);

  return (
    <>
      <fieldset className="project-filter">
        <legend className="sr-only">Filter projects by category</legend>
        {categories.map((category) => <button key={category} type="button" className="filter-button" aria-pressed={active === category} onClick={() => setActive(category)}>{category}</button>)}
      </fieldset>
      <motion.div className="project-grid" layout>
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((project) => {
            const index = projects.findIndex((item) => item.slug === project.slug);
            return <motion.div key={project.slug} layout initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: reduceMotion ? 0.12 : 0.32, ease: [0.2, 0.65, 0.3, 1] }}><ProjectCard project={project} index={index} featured={index % 2 === 0} /></motion.div>;
          })}
        </AnimatePresence>
      </motion.div>
      {!visible.length ? <div className="empty-state">No projects match this category yet.</div> : null}
    </>
  );
}
