import type { NextConfig } from "next";

// Necessário para ligação ao Supabase Pooler (certificado self-signed na cadeia)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Permitir HMR a partir da rede local (192.168.x.x)
  // Necessário quando o browser acede pelo IP da rede em vez de localhost
  allowedDevOrigins: ["192.168.1.27"],

  // Compressão
  compress: true,

  // Headers de segurança e SEO
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Segurança
          { key: "X-Frame-Options",          value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options",   value: "nosniff" },
          { key: "X-XSS-Protection",         value: "1; mode=block" },
          { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",       value: "camera=(), microphone=(), geolocation=(self)" },
          // HSTS (só activar quando HTTPS estiver 100% configurado)
          // { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      // Cache para assets estáticos
      {
        source: "/(.*)\\.(ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|otf)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Cache para JS/CSS com hash
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  // Redirects canónicos (www → sem www, forçar HTTPS em produção)
  async redirects() {
    return [
      // Redirecionar www para apex (SEO canonical)
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.clinicapro.pt" }],
        destination: "https://clinicapro.pt/:path*",
        permanent: true,
      },
    ];
  },

  // Imagens otimizadas
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [],
  },

  // Logging em produção
  logging: {
    fetches: { fullUrl: false },
  },
};

export default nextConfig;
