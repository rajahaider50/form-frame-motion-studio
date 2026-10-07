"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import {
  ArrowUpRight, Check, ExternalLink, Eye, FileText, Inbox, LayoutDashboard,
  LoaderCircle, LogOut, Plus, RefreshCw, Save, Settings2, Trash2,
} from "lucide-react";
import type { Inquiry, InquiryStatus, Project, Service, SiteContent } from "@/lib/site-content-schema";
import { AdminLogin } from "@/components/admin-login";

const imageChoices = [
  { value: "/images/project-afterlight.svg", label: "Afterlight · amber glass" },
  { value: "/images/project-signal-noir.svg", label: "Signal / Noise · chrome" },
  { value: "/images/project-soft-geometry.svg", label: "Soft Geometry · still life" },
];

type Notice = { kind: "success" | "error" | "info"; text: string } | null;
type AdminTab = "overview" | "content" | "inquiries";
type ApiError = { error?: string };

async function responseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

export function AdminConsole() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<AdminTab>("overview");
  const [content, setContent] = useState<SiteContent | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [notice, setNotice] = useState<Notice>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const contentResponse = await fetch("/api/admin/content", { cache: "no-store" });
      if (contentResponse.status === 401) {
        setAuthenticated(false);
        setContent(null);
        setInquiries([]);
        return;
      }
      setAuthenticated(true);
      if (!contentResponse.ok) {
        const error = await responseJson<ApiError>(contentResponse);
        setNotice({ kind: "error", text: error.error || "Site content is unavailable." });
        return;
      }
      const contentPayload = await responseJson<{ content: SiteContent }>(contentResponse);
      setContent(contentPayload.content);
      const inquiryResponse = await fetch("/api/admin/messages", { cache: "no-store" });
      if (inquiryResponse.ok) {
        const inquiryPayload = await responseJson<{ messages: Inquiry[] }>(inquiryResponse);
        setInquiries(inquiryPayload.messages);
      } else if (inquiryResponse.status !== 401) {
        const error = await responseJson<ApiError>(inquiryResponse);
        setNotice({ kind: "error", text: error.error || "The inquiry inbox is unavailable." });
      }
    } catch {
      setNotice({ kind: "error", text: "The studio console could not reach the server." });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const newInquiryCount = useMemo(() => inquiries.filter((item) => item.status === "new").length, [inquiries]);

  async function saveContent() {
    if (!content || saving) return;
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const payload = await responseJson<{ error?: string; content?: SiteContent }>(response);
      if (!response.ok || !payload.content) throw new Error(payload.error || "The changes could not be saved.");
      setContent(payload.content);
      setNotice({ kind: "success", text: "Saved. The public site is now using your latest content." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "The changes could not be saved." });
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(item: Inquiry, status: InquiryStatus) {
    setNotice(null);
    try {
      const response = await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, status }),
      });
      const payload = await responseJson<{ error?: string; message?: Inquiry }>(response);
      const updatedMessage = payload.message;
      if (!response.ok || !updatedMessage) throw new Error(payload.error || "The status could not be updated.");
      setInquiries((items) => items.map((entry) => entry.id === item.id ? updatedMessage : entry));
      setNotice({ kind: "success", text: "Inquiry status updated." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "The status could not be updated." });
    }
  }

  async function logOut() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      setAuthenticated(false);
      setContent(null);
      setInquiries([]);
      setNotice(null);
    }
  }

  if (loading) return <main className="container admin-page"><p className="admin-loading" role="status">Opening your studio console…</p></main>;
  if (!authenticated) return <AdminLogin />;

  return (
    <main className="container admin-page">
      <div className="admin-shell">
        <aside className="admin-sidebar" aria-label="Console sections">
          <p className="admin-sidebar__label">Manage the studio</p>
          <button type="button" aria-current={tab === "overview" ? "page" : undefined} onClick={() => setTab("overview")}><LayoutDashboard size={16} /><span>Overview</span></button>
          <button type="button" aria-current={tab === "content" ? "page" : undefined} onClick={() => setTab("content")}><Settings2 size={16} /><span>Site content</span></button>
          <button type="button" aria-current={tab === "inquiries" ? "page" : undefined} onClick={() => setTab("inquiries")}><Inbox size={16} /><span>Inquiries{newInquiryCount > 0 ? ` · ${newInquiryCount}` : ""}</span></button>
        </aside>

        <section className="admin-main" aria-live="polite">
          <div className="admin-topbar">
            <div><p className="eyebrow"><span className="status-dot" /> PRIVATE STUDIO CONSOLE</p><h1>{tab === "overview" ? "Good to see you." : tab === "content" ? "The public frame." : "Notes from the outside."}</h1></div>
            <div className="admin-topbar__actions">
              <Link href="/" target="_blank" rel="noreferrer"><Eye size={14} />Live preview<ExternalLink size={12} /></Link>
              <button type="button" onClick={() => void loadData(true)} disabled={refreshing}>{refreshing ? <LoaderCircle className="spinner" size={14} /> : <RefreshCw size={14} />}Refresh</button>
              <button type="button" onClick={() => void logOut()}><LogOut size={14} />Sign out</button>
            </div>
          </div>

          {notice ? <p className={`admin-notice admin-notice--${notice.kind}`} role="status">{notice.text}</p> : null}

          {tab === "overview" ? <Overview content={content} inquiries={inquiries} newCount={newInquiryCount} onGo={(next) => setTab(next)} /> : null}
          {tab === "content" && content ? <ContentEditor content={content} onChange={setContent} onSave={() => void saveContent()} saving={saving} /> : null}
          {tab === "inquiries" ? <InquiryInbox inquiries={inquiries} onStatusChange={(item, status) => void updateStatus(item, status)} /> : null}
        </section>
      </div>
    </main>
  );
}

function Overview({ content, inquiries, newCount, onGo }: { content: SiteContent | null; inquiries: Inquiry[]; newCount: number; onGo: (tab: AdminTab) => void }) {
  return (
    <>
      <div className="admin-overview-grid">
        <div className="admin-stat"><span>New inquiries</span><strong>{String(newCount).padStart(2, "0")}</strong></div>
        <div className="admin-stat"><span>Live projects</span><strong>{String(content?.projects.length ?? 0).padStart(2, "0")}</strong></div>
        <div className="admin-stat"><span>Studio services</span><strong>{String(content?.services.length ?? 0).padStart(2, "0")}</strong></div>
      </div>
      <div className="admin-panel">
        <div className="admin-panel__heading"><h2>Your next frame</h2><span>Everything here updates the public site</span></div>
        <p className="muted">The studio site is driven by the content below. Edit the brand, contact details, homepage story, capabilities, project portfolio, and process. Save once to publish your latest content to the site.</p>
        <div className="admin-topbar__actions"><button type="button" onClick={() => onGo("content")}><FileText size={14} />Edit site content</button><button type="button" onClick={() => onGo("inquiries")}><Inbox size={14} />Open inquiry inbox</button></div>
      </div>
      <div className="admin-panel">
        <div className="admin-panel__heading"><h2>Recent conversations</h2><button type="button" className="admin-small-button" onClick={() => onGo("inquiries")}>Open inbox <ArrowUpRight size={13} /></button></div>
        {inquiries.slice(0, 3).length ? <div className="inquiry-list">{inquiries.slice(0, 3).map((item) => <InquiryCard key={item.id} inquiry={item} onStatusChange={() => onGo("inquiries")} compact />)}</div> : <div className="empty-state">No inquiries yet. New project notes will arrive here.</div>}
      </div>
    </>
  );
}

function ContentEditor({ content, onChange, onSave, saving }: { content: SiteContent; onChange: (content: SiteContent) => void; onSave: () => void; saving: boolean }) {
  const [localNotice, setLocalNotice] = useState("");
  const brand = content.brand;
  const hero = content.hero;
  const about = content.about;

  function updateBrand<K extends keyof SiteContent["brand"]>(key: K, value: SiteContent["brand"][K]) {
    onChange({ ...content, brand: { ...content.brand, [key]: value } });
    setLocalNotice("");
  }
  function updateHero<K extends keyof SiteContent["hero"]>(key: K, value: SiteContent["hero"][K]) {
    onChange({ ...content, hero: { ...content.hero, [key]: value } });
    setLocalNotice("");
  }
  function updateAbout<K extends keyof SiteContent["about"]>(key: K, value: SiteContent["about"][K]) {
    onChange({ ...content, about: { ...content.about, [key]: value } });
    setLocalNotice("");
  }
  function updateMilestone(index: number, patch: Partial<SiteContent["about"]["milestones"][number]>) {
    updateAbout("milestones", about.milestones.map((item, position) => position === index ? { ...item, ...patch } : item));
  }
  function updateService(id: string, patch: Partial<Service>) {
    onChange({ ...content, services: content.services.map((item) => item.id === id ? { ...item, ...patch } : item) });
    setLocalNotice("");
  }
  function updateProject(slug: string, patch: Partial<Project>) {
    onChange({ ...content, projects: content.projects.map((item) => item.slug === slug ? { ...item, ...patch } : item) });
    setLocalNotice("");
  }
  function updateProcess(id: string, patch: Partial<SiteContent["process"][number]>) {
    onChange({ ...content, process: content.process.map((item) => item.id === id ? { ...item, ...patch } : item) });
    setLocalNotice("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalNotice("Checking and saving all site content…");
    onSave();
  }

  return (
    <form onSubmit={submit}>
      <section className="admin-panel">
        <div className="admin-panel__heading"><h2>Brand & contact</h2><span>These details appear across the site</span></div>
        <div className="admin-field-grid">
          <AdminField label="Studio name" value={brand.name} onChange={(value) => updateBrand("name", value)} />
          <AdminField label="Descriptor" value={brand.descriptor} onChange={(value) => updateBrand("descriptor", value)} />
          <AdminField label="Studio email" value={brand.email} type="email" onChange={(value) => updateBrand("email", value)} />
          <AdminField label="Phone / WhatsApp" value={brand.phone} onChange={(value) => updateBrand("phone", value)} />
          <AdminField label="Location line" value={brand.location} onChange={(value) => updateBrand("location", value)} />
          <AdminField label="Instagram URL" value={brand.instagramUrl} type="url" onChange={(value) => updateBrand("instagramUrl", value)} />
          <AdminField wide label="SEO title" value={brand.seoTitle} onChange={(value) => updateBrand("seoTitle", value)} />
          <AdminArea wide label="SEO description" value={brand.seoDescription} onChange={(value) => updateBrand("seoDescription", value)} rows={3} />
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel__heading"><h2>Homepage hero</h2><span>First words people remember</span></div>
        <div className="admin-field-grid">
          <AdminField wide label="Eyebrow" value={hero.eyebrow} onChange={(value) => updateHero("eyebrow", value)} />
          <AdminField label="Headline — first line" value={hero.title} onChange={(value) => updateHero("title", value)} />
          <AdminField label="Headline — accent line" value={hero.highlight} onChange={(value) => updateHero("highlight", value)} />
          <AdminArea wide label="Hero description" value={hero.body} onChange={(value) => updateHero("body", value)} rows={3} />
          <AdminField label="Primary button" value={hero.cta} onChange={(value) => updateHero("cta", value)} />
          <AdminField label="Secondary button" value={hero.secondaryCta} onChange={(value) => updateHero("secondaryCta", value)} />
          <AdminField label="Project count marker" value={hero.projectCount} onChange={(value) => updateHero("projectCount", value)} />
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel__heading"><h2>About the studio</h2><span>Story, statement, and proof points</span></div>
        <div className="admin-field-grid">
          <AdminField wide label="Eyebrow" value={about.eyebrow} onChange={(value) => updateAbout("eyebrow", value)} />
          <AdminField wide label="Headline" value={about.title} onChange={(value) => updateAbout("title", value)} />
          <AdminArea wide label="Intro line" value={about.intro} onChange={(value) => updateAbout("intro", value)} rows={2} />
          <AdminArea wide label="Studio story" value={about.body} onChange={(value) => updateAbout("body", value)} rows={4} />
          <AdminArea wide label="Closing note" value={about.closing} onChange={(value) => updateAbout("closing", value)} rows={3} />
          <AdminArea wide label="Pull quote" value={about.statement} onChange={(value) => updateAbout("statement", value)} rows={2} />
          <AdminArea wide label="Call-to-action headline" value={about.ctaTitle} onChange={(value) => updateAbout("ctaTitle", value)} rows={2} />
          <AdminField label="Call-to-action button" value={about.ctaButton} onChange={(value) => updateAbout("ctaButton", value)} />
          <AdminField label="Years" value={about.years} onChange={(value) => updateAbout("years", value)} />
          <AdminField label="Collaborators" value={about.collaborators} onChange={(value) => updateAbout("collaborators", value)} />
          <AdminField label="Time zones" value={about.timeZones} onChange={(value) => updateAbout("timeZones", value)} />
        </div>
        <div className="admin-panel__heading admin-panel__heading--spaced"><h3>Studio timeline</h3><button className="admin-small-button" type="button" disabled={about.milestones.length >= 8} onClick={() => updateAbout("milestones", [...about.milestones, { year: String(new Date().getFullYear()), title: "A new chapter", description: "Add a defining moment in the studio story." }])}><Plus size={13} />Add milestone</button></div>
        {about.milestones.map((milestone, index) => <div className="admin-repeat-card" key={`${milestone.year}-${milestone.title}`}><div className="admin-repeat-card__head"><strong>{milestone.year} · {milestone.title}</strong><button className="admin-small-button admin-small-button--danger" type="button" disabled={about.milestones.length <= 2} aria-label={`Remove ${milestone.title}`} onClick={() => updateAbout("milestones", about.milestones.filter((_, position) => position !== index))}><Trash2 size={13} />Remove</button></div><div className="admin-field-grid"><AdminField label="Year" value={milestone.year} onChange={(value) => updateMilestone(index, { year: value })} /><AdminField label="Milestone title" value={milestone.title} onChange={(value) => updateMilestone(index, { title: value })} /><AdminArea wide label="Story note" value={milestone.description} onChange={(value) => updateMilestone(index, { description: value })} rows={2} /></div></div>)}
      </section>

      <section className="admin-panel">
        <div className="admin-panel__heading"><h2>Services</h2><button className="admin-small-button" type="button" onClick={() => onChange({ ...content, services: [...content.services, { id: `new-service-${Date.now()}`, number: String(content.services.length + 1).padStart(2, "0"), title: "New service", description: "Describe the offer in one clear sentence.", detail: "Add the complete service description here.", tags: ["New capability"] }] })}><Plus size={13} />Add service</button></div>
        {content.services.map((service, index) => (
          <div className="admin-repeat-card" key={service.id}>
            <div className="admin-repeat-card__head"><strong>{service.number} · {service.title}</strong><button className="admin-small-button admin-small-button--danger" type="button" disabled={content.services.length <= 1} aria-label={`Remove ${service.title}`} onClick={() => onChange({ ...content, services: content.services.filter((item) => item.id !== service.id) })}><Trash2 size={13} />Remove</button></div>
            <div className="admin-field-grid">
              <AdminField label="Service title" value={service.title} onChange={(value) => updateService(service.id, { title: value })} />
              <AdminField label="Service number" value={service.number} onChange={(value) => updateService(service.id, { number: value })} />
              <AdminArea wide label="Short description" value={service.description} onChange={(value) => updateService(service.id, { description: value })} rows={2} />
              <AdminArea wide label="Full detail" value={service.detail} onChange={(value) => updateService(service.id, { detail: value })} rows={3} />
              <AdminField wide label="Tags — separate with commas" value={service.tags.join(", ")} onChange={(value) => updateService(service.id, { tags: value.split(",").map((tag) => tag.trim()).filter(Boolean) })} />
            </div>
            <span className="muted">Service {index + 1} · ID {service.id}</span>
          </div>
        ))}
      </section>

      <section className="admin-panel">
        <div className="admin-panel__heading"><h2>Project portfolio</h2><button className="admin-small-button" type="button" onClick={() => {
          const slug = `new-project-${Date.now()}`;
          onChange({ ...content, projects: [...content.projects, { slug, title: "New project", category: "Creative work", year: String(new Date().getFullYear()), summary: "A short intro to this project.", description: "Add the project story and context here.", client: "Client name", role: "Studio role", cover: imageChoices[0].value, accent: "#8c70ff", deliverables: ["Hero film"] }] });
        }}><Plus size={13} />Add project</button></div>
        {content.projects.map((project, index) => (
          <div className="admin-repeat-card" key={project.slug}>
            <div className="admin-repeat-card__head"><strong>{String(index + 1).padStart(2, "0")} · {project.title}</strong><button className="admin-small-button admin-small-button--danger" type="button" disabled={content.projects.length <= 1} aria-label={`Remove ${project.title}`} onClick={() => onChange({ ...content, projects: content.projects.filter((item) => item.slug !== project.slug) })}><Trash2 size={13} />Remove</button></div>
            <div className="admin-field-grid">
              <AdminField label="Project title" value={project.title} onChange={(value) => updateProject(project.slug, { title: value })} />
              <AdminField label="URL slug (lowercase-hyphenated)" value={project.slug} onChange={(value) => updateProject(project.slug, { slug: value })} />
              <AdminField label="Category" value={project.category} onChange={(value) => updateProject(project.slug, { category: value })} />
              <AdminField label="Year" value={project.year} onChange={(value) => updateProject(project.slug, { year: value })} />
              <AdminField label="Client" value={project.client} onChange={(value) => updateProject(project.slug, { client: value })} />
              <AdminField label="Studio role" value={project.role} onChange={(value) => updateProject(project.slug, { role: value })} />
              <AdminField wide label="Short summary" value={project.summary} onChange={(value) => updateProject(project.slug, { summary: value })} />
              <AdminArea wide label="Project description" value={project.description} onChange={(value) => updateProject(project.slug, { description: value })} rows={3} />
              <label className="field"><span>Cover artwork</span><select value={project.cover} onChange={(event) => updateProject(project.slug, { cover: event.target.value })}>{imageChoices.map((image) => <option key={image.value} value={image.value}>{image.label}</option>)}</select></label>
              <AdminField label="Accent color (#RRGGBB)" value={project.accent} onChange={(value) => updateProject(project.slug, { accent: value })} />
              <AdminField wide label="Deliverables — separate with commas" value={project.deliverables.join(", ")} onChange={(value) => updateProject(project.slug, { deliverables: value.split(",").map((item) => item.trim()).filter(Boolean) })} />
            </div>
          </div>
        ))}
      </section>

      <section className="admin-panel">
        <div className="admin-panel__heading"><h2>Process steps</h2><button className="admin-small-button" type="button" onClick={() => onChange({ ...content, process: [...content.process, { id: `step-${Date.now()}`, title: "New step", description: "Add a short description." }] })}><Plus size={13} />Add step</button></div>
        {content.process.map((step) => (
          <div className="admin-repeat-card" key={step.id}>
            <div className="admin-repeat-card__head"><strong>{step.title}</strong><button className="admin-small-button admin-small-button--danger" type="button" disabled={content.process.length <= 2} aria-label={`Remove ${step.title}`} onClick={() => onChange({ ...content, process: content.process.filter((item) => item.id !== step.id) })}><Trash2 size={13} />Remove</button></div>
            <div className="admin-field-grid"><AdminField label="Step title" value={step.title} onChange={(value) => updateProcess(step.id, { title: value })} /><AdminField label="Step ID" value={step.id} onChange={(value) => updateProcess(step.id, { id: value })} /><AdminArea wide label="Description" value={step.description} onChange={(value) => updateProcess(step.id, { description: value })} rows={2} /></div>
          </div>
        ))}
      </section>

      <div className="admin-savebar">
        <p>{localNotice || "Updates are saved as one validated change."}</p>
        <button className="button button--primary button--small" type="submit" disabled={saving}>{saving ? <LoaderCircle className="spinner" size={15} /> : <><Save size={14} />Save all changes<Check size={14} /></>}</button>
      </div>
    </form>
  );
}

function AdminField({ label, value, onChange, type = "text", wide = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; wide?: boolean }) {
  return <label className={`field${wide ? " field--wide" : ""}`}><span>{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function AdminArea({ label, value, onChange, rows = 3, wide = false }: { label: string; value: string; onChange: (value: string) => void; rows?: number; wide?: boolean }) {
  return <label className={`field${wide ? " field--wide" : ""}`}><span>{label}</span><textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function InquiryInbox({ inquiries, onStatusChange }: { inquiries: Inquiry[]; onStatusChange: (item: Inquiry, status: InquiryStatus) => void }) {
  return (
    <div className="admin-panel">
      <div className="admin-panel__heading"><h2>Project inquiries</h2><span>{inquiries.length} stored · newest first</span></div>
      {inquiries.length ? <div className="inquiry-list">{inquiries.map((item) => <InquiryCard key={item.id} inquiry={item} onStatusChange={(status) => onStatusChange(item, status)} />)}</div> : <div className="empty-state">No inquiry has arrived yet. The public contact form is ready to receive the first one.</div>}
    </div>
  );
}

function InquiryCard({ inquiry, onStatusChange, compact = false }: { inquiry: Inquiry; onStatusChange: (status: InquiryStatus) => void; compact?: boolean }) {
  const date = new Date(inquiry.createdAt);
  return (
    <article className="inquiry-card">
      <div className="inquiry-card__top"><div><h3>{inquiry.name}{inquiry.company ? ` · ${inquiry.company}` : ""}</h3><div className="inquiry-card__meta"><a href={`mailto:${inquiry.email}`}>{inquiry.email}</a><span>{inquiry.service}</span></div></div><time dateTime={inquiry.createdAt}>{Number.isNaN(date.getTime()) ? "Recent" : date.toLocaleString()}</time></div>
      {!compact ? <p className="inquiry-card__body">{inquiry.message}</p> : <p className="inquiry-card__body">{inquiry.message.length > 180 ? `${inquiry.message.slice(0, 180)}…` : inquiry.message}</p>}
      <div className="inquiry-card__bottom"><span className="inquiry-status">{inquiry.status.toUpperCase()}</span>{compact ? <button type="button" className="admin-small-button" onClick={() => onStatusChange(inquiry.status)}>Open inbox <ArrowUpRight size={12} /></button> : <div className="inquiry-card__actions"><a className="admin-small-button" href={`mailto:${inquiry.email}?subject=${encodeURIComponent("Your FORM / FRAME project note")}`}><ArrowUpRight size={13} />Reply by email</a><select aria-label={`Status for inquiry from ${inquiry.name}`} value={inquiry.status} onChange={(event) => onStatusChange(event.target.value as InquiryStatus)}><option value="new">New</option><option value="reviewing">Reviewing</option><option value="replied">Replied</option></select></div>}</div>
    </article>
  );
}
