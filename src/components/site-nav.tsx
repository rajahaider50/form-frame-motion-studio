"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { SoundToggle } from "@/components/sound-toggle";

type SiteNavProps = { name: string; descriptor: string };
const links = [
  { href: "/about", label: "Studio" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Selected work" },
];

export function SiteNav({ name, descriptor }: SiteNavProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    const updateScrollState = () => setScrolled(window.scrollY > 24);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    if (previousPathname.current !== pathname) setOpen(false);
    previousPathname.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <header className={`site-header${scrolled ? " site-header--scrolled" : ""}`}>
      <div className="site-header__inner">
        <BrandMark name={name} descriptor={descriptor} />
        <nav id="primary-menu" className={`primary-nav${open ? " primary-nav--open" : ""}`} aria-label="Main navigation">
          {links.map((link) => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined} onClick={() => setOpen(false)} data-sonic="true">{link.label}</Link>)}
          <Link className="primary-nav__mobile-contact" href="/contact" onClick={() => setOpen(false)}>Let&apos;s talk <ArrowUpRight size={15} aria-hidden="true" /></Link>
        </nav>
        <div className="site-header__actions">
          <SoundToggle />
          <Link className="button button--small button--outline header-contact" href="/contact" data-sonic="true">Let&apos;s talk <ArrowUpRight size={15} aria-hidden="true" /></Link>
          <button type="button" className="menu-toggle" aria-label={open ? "Close navigation" : "Open navigation"} aria-controls="primary-menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
