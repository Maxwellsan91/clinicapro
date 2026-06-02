import type { Metadata } from "next";
import { Navbar }       from "@/components/landing/Navbar";
import { Hero }         from "@/components/landing/Hero";
import { Services }     from "@/components/landing/Services";
import { Benefits }     from "@/components/landing/Benefits";
import { HowItWorks }   from "@/components/landing/HowItWorks";
import { About }        from "@/components/landing/About";
import { Team }         from "@/components/landing/Team";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ }          from "@/components/landing/FAQ";
import { CTA }          from "@/components/landing/CTA";
import { Contact }      from "@/components/landing/Contact";
import { Footer }       from "@/components/landing/Footer";
import { AllSchemas }   from "@/components/landing/JsonLd";
import {
  SITE_URL, SITE_NAME, SITE_DESCRIPTION,
  DEFAULT_OG_IMAGE, KEYWORDS,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Fisioterapia, Pilates e Massagem em Lisboa`,
  description: SITE_DESCRIPTION,
  keywords: [...KEYWORDS.primary, ...KEYWORDS.secondary, ...KEYWORDS.brand],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Fisioterapia, Pilates e Massagem em Lisboa`,
    description: SITE_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} — Centro Clínico Premium Lisboa` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Fisioterapia, Pilates e Massagem em Lisboa`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function LandingPage() {
  return (
    <>
      {/* JSON-LD Schemas para o Google */}
      <AllSchemas />

      <Navbar />

      <main id="main-content">
        {/* H1 implícito na Hero section — ver Hero.tsx */}
        <Hero />
        <Services />
        <Benefits />
        <HowItWorks />
        <About />
        <Team />
        <Testimonials />
        <FAQ />
        <CTA />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
