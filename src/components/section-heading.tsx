type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  detail?: string;
  light?: boolean;
};

export function SectionHeading({ eyebrow, title, detail, light = false }: SectionHeadingProps) {
  return (
    <div className={`section-heading${light ? " section-heading--light" : ""}`}>
      <p className="eyebrow"><span className="eyebrow-mark" aria-hidden="true" />{eyebrow}</p>
      <h2>{title}</h2>
      {detail ? <p className="section-heading__detail">{detail}</p> : null}
    </div>
  );
}
