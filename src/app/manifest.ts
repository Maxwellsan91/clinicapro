import type { MetadataRoute } from "next";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Fisioterapia, Pilates e Massagem em Lisboa`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    orientation: "portrait-primary",
    lang: "pt-PT",
    icons: [
      { src: "/favicon.ico",   sizes: "any",       type: "image/x-icon" },
      { src: "/icon-192.png",  sizes: "192x192",   type: "image/png" },
      { src: "/icon-512.png",  sizes: "512x512",   type: "image/png" },
      { src: "/icon-512.png",  sizes: "512x512",   type: "image/png", purpose: "maskable" },
    ],
    categories: ["health", "medical", "lifestyle"],
    screenshots: [
      { src: "/og-image.png", sizes: "1200x630", type: "image/png" },
    ],
  };
}

