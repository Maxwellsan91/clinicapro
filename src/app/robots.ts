import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/clientes",
          "/colaboradores",
          "/agendamentos",
          "/servicos",
          "/pagamentos",
          "/comissoes",
          "/utilizadores",
          "/auditoria",
          "/notificacoes",
          "/login",
          "/auth/",
          "/api/",
        ],
      },
      // Bloquear scrapers agressivos
      {
        userAgent: ["AhrefsBot", "SemrushBot", "MJ12bot", "DotBot"],
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

