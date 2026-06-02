/**
 * POST /api/cron/notifications
 *
 * Endpoint de cron para processar a fila de notificações.
 *
 * Deve ser chamado de hora em hora (ex: Vercel Cron, GitHub Actions, Render cron).
 * Protegido por CRON_SECRET.
 *
 * Exemplo de header: Authorization: Bearer <CRON_SECRET>
 *
 * Vercel cron config (vercel.json):
 * {
 *   "crons": [{ "path": "/api/cron/notifications", "schedule": "0 * * * *" }]
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { processNotificationQueue } from "@/server/services/notification-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // Verificar autorização
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    const token = auth?.replace("Bearer ", "").trim();
    if (token !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await processNotificationQueue();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Cron] Erro no processamento de notificações:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// GET para verificação de saúde (útil para Vercel Cron)
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    const token = auth?.replace("Bearer ", "").trim();
    if (token !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await processNotificationQueue();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

