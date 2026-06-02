import { Sidebar } from "@/components/layout/Sidebar";
import { getUser, getUserRole } from "@/features/auth/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, role] = await Promise.all([getUser(), getUserRole()]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userEmail={user?.email} role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
