import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { getUser, getUserRole } from "@/features/auth/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, role] = await Promise.all([getUser(), getUserRole()]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar — apenas desktop */}
      <Sidebar userEmail={user?.email} role={role} />

      {/* Navegação mobile (top bar + drawer + bottom nav) */}
      <MobileNav userEmail={user?.email} role={role} />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pt-14 pb-16 md:pt-0 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
