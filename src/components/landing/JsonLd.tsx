import {
  SITE_URL, SITE_NAME, SITE_DESCRIPTION,
  CLINIC_ADDRESS, CLINIC_CONTACT, CLINIC_HOURS,
  CLINIC_GEO, SOCIAL_PROFILES, DEFAULT_OG_IMAGE,
} from "@/lib/seo";
import { faqs, services, testimonials, team } from "@/components/landing/data";

// ── LocalBusiness + MedicalClinic ─────────────────────────────────────
export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["MedicalClinic", "LocalBusiness"],
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: "GlobalFisio Fisioterapia Lisboa",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`,
      width: 512,
      height: 512,
    },
    image: DEFAULT_OG_IMAGE,
    telephone: CLINIC_CONTACT.phone,
    email: CLINIC_CONTACT.email,
    address: {
      "@type": "PostalAddress",
      ...CLINIC_ADDRESS,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: CLINIC_GEO.latitude,
      longitude: CLINIC_GEO.longitude,
    },
    openingHours: CLINIC_HOURS,
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "08:00", closes: "20:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "09:00", closes: "16:00" },
    ],
    priceRange: "€€",
    currenciesAccepted: "EUR",
    paymentAccepted: "Cash, Credit Card, Debit Card, Health Insurance",
    medicalSpecialty: ["Physiotherapy", "Physical Therapy", "Rehabilitation"],
    availableService: services.map((s) => ({
      "@type": "MedicalTherapy",
      name: s.title,
      description: s.description,
    })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: testimonials.length,
      bestRating: "5",
      worstRating: "1",
    },
    review: testimonials.map((t) => ({
      "@type": "Review",
      author: { "@type": "Person", name: t.name },
      reviewRating: { "@type": "Rating", ratingValue: t.rating, bestRating: "5" },
      reviewBody: t.comment,
      datePublished: "2025-01-01",
    })),
    sameAs: SOCIAL_PROFILES,
    hasMap: `https://maps.google.com/?q=Av.+da+Liberdade+150+Lisboa`,
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: { "@type": "GeoCoordinates", latitude: CLINIC_GEO.latitude, longitude: CLINIC_GEO.longitude },
      geoRadius: "20000",
    },
    founder: {
      "@type": "Person",
      name: team[0].name,
      jobTitle: team[0].role,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ── FAQPage Schema ────────────────────────────────────────────────────
export function FAQSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ── WebSite Schema (SearchAction / Sitelinks) ─────────────────────────
export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: "pt-PT",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ── BreadcrumbList ────────────────────────────────────────────────────
export function BreadcrumbSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início",   item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Serviços", item: `${SITE_URL}/#servicos` },
      { "@type": "ListItem", position: 3, name: "Equipa",   item: `${SITE_URL}/#equipa` },
      { "@type": "ListItem", position: 4, name: "Contactos",item: `${SITE_URL}/#contactos` },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ── Profissionais (Person + MedicalSpecialty) ─────────────────────────
export function TeamSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Equipa GlobalFisio",
    itemListElement: team.map((member, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Physician",
        name: member.name,
        jobTitle: member.role,
        description: member.bio,
        worksFor: { "@id": `${SITE_URL}/#organization` },
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ── Componente único que injeta todos os schemas ───────────────────────
export function AllSchemas() {
  return (
    <>
      <LocalBusinessSchema />
      <FAQSchema />
      <WebsiteSchema />
      <BreadcrumbSchema />
      <TeamSchema />
    </>
  );
}

