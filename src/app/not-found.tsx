import Link from "next/link";
import { ArrowLeft, MoveUpRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="container page-intro not-found-page">
      <div className="not-found-card">
        <p className="eyebrow"><span className="eyebrow-mark" /> This frame didn&apos;t make the final cut</p>
        <h1>Lost in<br /><span>the edit.</span></h1>
        <p className="not-found-card__copy">The page you&apos;re looking for may have moved, or we might be working on a new version.</p>
        <Link className="button button--outline" href="/"><ArrowLeft size={16} aria-hidden="true" />Back to the beginning</Link>
        <span className="not-found-card__index" aria-hidden="true">404 <MoveUpRight size={13} /></span>
      </div>
    </main>
  );
}
