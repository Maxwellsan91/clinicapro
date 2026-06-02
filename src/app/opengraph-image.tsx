import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/seo";

export const runtime = "edge";
export const alt = "ClinicaPro — Fisioterapia, Pilates e Massagem em Lisboa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #3b82f6 100%)",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Background pattern */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "radial-gradient(circle at 70% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)",
        }} />

        {/* Logo area */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56,
            background: "rgba(255,255,255,0.2)",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
          }}>
            ❤️
          </div>
          <span style={{ color: "white", fontSize: 32, fontWeight: 700, letterSpacing: "-0.5px" }}>
            {SITE_NAME}
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          color: "white",
          fontSize: 58,
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: 24,
          maxWidth: 700,
          letterSpacing: "-1px",
        }}>
          Fisioterapia, Pilates e Massagem em Lisboa
        </h1>

        {/* Sub */}
        <p style={{
          color: "rgba(255,255,255,0.8)",
          fontSize: 24,
          maxWidth: 600,
          lineHeight: 1.5,
          marginBottom: 48,
        }}>
          Centro clínico premium com profissionais certificados e tecnologia avançada.
        </p>

        {/* Badges */}
        <div style={{ display: "flex", gap: 16 }}>
          {["+2000 Pacientes", "98% Satisfação", "Desde 2015"].map((badge) => (
            <div key={badge} style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: 40,
              padding: "10px 20px",
              color: "white",
              fontSize: 16,
              fontWeight: 600,
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}>
              {badge}
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{
          position: "absolute",
          bottom: 48,
          right: 80,
          color: "rgba(255,255,255,0.5)",
          fontSize: 18,
          fontWeight: 500,
        }}>
          clinicapro.pt
        </div>
      </div>
    ),
    { ...size }
  );
}

