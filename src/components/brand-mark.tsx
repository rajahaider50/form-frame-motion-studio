import Link from "next/link";

type BrandMarkProps = {
  name: string;
  descriptor?: string;
  compact?: boolean;
  href?: string;
};

export function BrandMark({ name, descriptor, compact = false, href = "/" }: BrandMarkProps) {
  return (
    <Link className={`brand-lockup${compact ? " brand-lockup--compact" : ""}`} href={href} aria-label={`${name} — home`}>
      <span className="brand-symbol" aria-hidden="true">
        <svg viewBox="0 0 40 40" fill="none">
          <title>Frame corner mark</title>
          <path d="M7 15V7h8M33 25v8h-8M10 30 30 10" />
          <path className="brand-symbol__accent" d="M27 10h6v6" />
          <circle className="brand-symbol__dot" cx="29.5" cy="10.5" r="2.2" />
        </svg>
      </span>
      <span className="brand-lockup__copy">
        <span className="brand-lockup__name">{name}</span>
        {descriptor && !compact ? <span className="brand-lockup__descriptor">{descriptor}</span> : null}
      </span>
    </Link>
  );
}
