import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — NÃO remover esta linha
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Rotas pblicas (no precisam de auth)
  const publicPaths = ["/login", "/auth/callback", "/auth/confirm", "/api/", "/manifest.webmanifest", "/robots.txt", "/sitemap.xml"];
  const isPublic =
    pathname === "/" ||
    publicPaths.some((p) => pathname.startsWith(p));

  // Utilizador não autenticado a tentar aceder a rota protegida
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Utilizador autenticado a aceder ao login — redirecionar para dashboard
  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Rotas exclusivas para admins
  const adminOnlyPaths = [
    "/pagamentos",
    "/colaboradores/novo",
    "/comissoes",
    "/utilizadores",
    "/auditoria",
    "/notificacoes",
  ];
  const isAdminOnlyPath =
    adminOnlyPaths.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    /^\/colaboradores\/[^/]+\/editar/.test(pathname);

  if (user && isAdminOnlyPath) {
    const role = user.user_metadata?.role as string | undefined;
    if (role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

