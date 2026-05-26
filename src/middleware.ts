import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Aplicar em todas as rotas excepto:
     * - _next/static (ficheiros estáticos)
     * - _next/image (optimização de imagens)
     * - favicon.ico, robots.txt, sitemap.xml
     * - ficheiros de assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

