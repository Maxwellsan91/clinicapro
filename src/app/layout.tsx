import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, DEFAULT_OG_IMAGE, KEYWORDS } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#2563eb",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: `${SITE_NAME} — Fisioterapia, Pilates e Massagem em Lisboa`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [...KEYWORDS.primary, ...KEYWORDS.secondary, ...KEYWORDS.brand],

  // Canonical e alternates
  alternates: {
    canonical: SITE_URL,
    languages: { "pt-PT": SITE_URL },
  },

  // Autoria
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  // Robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Open Graph
  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Fisioterapia, Pilates e Massagem em Lisboa`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Centro Clínico Premium Lisboa`,
        type: "image/png",
      },
    ],
  },

  // Twitter / X Cards
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Fisioterapia, Pilates e Massagem em Lisboa`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
    creator: "@clinicapro",
    site: "@clinicapro",
  },

  // App / PWA icons
  icons: {
    icon: [
      { url: "/favicon.ico",              sizes: "any" },
      { url: "/icon-192.png",             sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png",             sizes: "512x512", type: "image/png" },
    ],
    apple:   [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },

  // Verification (preencher quando disponível)
  verification: {
    google:   process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION  ?? "",
    yandex:   process.env.NEXT_PUBLIC_YANDEX_VERIFICATION  ?? "",
    yahoo:    process.env.NEXT_PUBLIC_YAHOO_VERIFICATION   ?? "",
    other: {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION ?? "",
    },
  },

  // Outros
  category: "health",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-PT"
      dir="ltr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Preconnect para performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch para recursos externos */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
