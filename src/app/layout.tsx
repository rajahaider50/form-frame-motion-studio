import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PageTransition } from "@/components/page-transition";
import { getSiteContent } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return {
    title: { default: content.brand.seoTitle, template: `%s — ${content.brand.name}` },
    description: content.brand.seoDescription,
    applicationName: content.brand.name,
    icons: { icon: "/brand-mark.svg", apple: "/brand-mark.svg" },
    openGraph: {
      title: content.brand.seoTitle,
      description: content.brand.seoDescription,
      type: "website",
      images: [{ url: "/images/hero-motion-studio.svg", width: 1800, height: 1000, alt: `${content.brand.name} motion studio artwork` }],
    },
    twitter: { card: "summary_large_image", title: content.brand.seoTitle, description: content.brand.seoDescription },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const content = await getSiteContent();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#08080b" />
      </head>
      <body>
        <a className="skip-link" href="#page-content">Skip to content</a>
        <SiteNav name={content.brand.name} descriptor={content.brand.descriptor} />
        <div id="page-content"><PageTransition>{children}</PageTransition></div>
        <SiteFooter
          name={content.brand.name}
          descriptor={content.brand.descriptor}
          email={content.brand.email}
          phone={content.brand.phone}
          location={content.brand.location}
          instagramUrl={content.brand.instagramUrl}
        />
      </body>
    </html>
  );
}
