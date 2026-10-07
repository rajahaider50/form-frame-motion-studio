import { BrandMark } from "@/components/brand-mark";

export default function Loading() {
  return (
    <main className="loading-screen" role="status" aria-label="Loading page">
      <BrandMark name="FORM / FRAME" descriptor="Independent motion & film studio" />
      <span className="loading-screen__line" aria-hidden="true" />
    </main>
  );
}
