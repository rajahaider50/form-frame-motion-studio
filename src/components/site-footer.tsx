import Link from "next/link";
import { ArrowUpRight, MoveUpRight } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

type SiteFooterProps = {
  name: string;
  descriptor: string;
  email: string;
  phone: string;
  location: string;
  instagramUrl: string;
};

export function SiteFooter({ name, descriptor, email, phone, location, instagramUrl }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="footer-orbit" aria-hidden="true" />
      <div className="container footer-inner">
        <div className="footer-cta">
          <span className="eyebrow"><span className="status-dot" /> The next frame is yours</span>
          <h2>Have a feeling<br /><span>worth following?</span></h2>
          <Link className="button button--primary" href="/contact" data-sonic="true">
            Tell us about it <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <div className="footer-bottom">
          <BrandMark name={name} descriptor={descriptor} />
          <div className="footer-contact">
            <a href={`mailto:${email}`}>{email}<MoveUpRight size={13} aria-hidden="true" /></a>
            <a href={`tel:${phone.replace(/[^+\d]/g, "")}`}>{phone}</a>
            <span>{location}</span>
          </div>
          <div className="footer-links">
            <Link href="/projects">Work</Link>
            <Link href="/services">Services</Link>
            <a href={instagramUrl} target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={13} aria-hidden="true" /></a>
          </div>
          <p className="copyright">© {new Date().getFullYear()} {name}. Crafted with intention.</p>
        </div>
      </div>
    </footer>
  );
}
