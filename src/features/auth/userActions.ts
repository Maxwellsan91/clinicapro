"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser, isAdmin } from "@/features/auth/actions";
import { createAuditLog } from "@/lib/audit";

export type UserWithRole = {
  id: string;
  email: string;
  role: "admin" | "user";
  jobTitle: string;
  createdAt: string;
};

export type UserActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function listUsers(): Promise<UserWithRole[]> {
  const admin = await isAdmin();
  if (!admin) throw new Error("Acesso negado");

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) throw new Error(error.message);

  return (data.users ?? []).map((u) => ({
    id: u.id,
    email: u.email ?? "(sem email)",
    role: (u.user_metadata?.role as "admin" | "user") ?? "user",
    jobTitle: (u.user_metadata?.jobTitle as string) ?? "",
    createdAt: u.created_at,
  }));
}

export async function updateUserRole(
  userId: string,
  newRole: "admin" | "user"
): Promise<UserActionResult> {
  const admin = await isAdmin();
  if (!admin) return { success: false, error: "Acesso negado" };

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { role: newRole },
  });

  if (error) return { success: false, error: error.message };

  const currentUser = await getUser();
  await createAuditLog({
    userId: currentUser?.id ?? "unknown",
    userEmail: currentUser?.email,
    action: "ROLE_CHANGE",
    entity: "Utilizador",
    entityId: userId,
    metadata: { newRole, targetUserId: userId },
  });

  revalidatePath("/utilizadores");
  return { success: true, message: `Role alterado para "${newRole}" com sucesso.` };
}

export async function inviteUser(
  email: string,
  role: "admin" | "user",
  password?: string,
  jobTitle?: string
): Promise<UserActionResult> {
  const admin = await isAdmin();
  if (!admin) return { success: false, error: "Acesso negado" };

  const supabase = createAdminClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: password || generateTempPassword(),
    email_confirm: true,
    user_metadata: { role, jobTitle: jobTitle ?? "" },
  });

  if (error) return { success: false, error: error.message };

  const currentUser = await getUser();
  await createAuditLog({
    userId: currentUser?.id ?? "unknown",
    userEmail: currentUser?.email,
    action: "CREATE",
    entity: "Utilizador",
    entityId: data.user?.id ?? email,
    metadata: { email, role, jobTitle },
  });

  revalidatePath("/utilizadores");
  return { success: true, message: `Utilizador ${email} criado com sucesso.` };
}

function generateTempPassword(): string {
  return Math.random().toString(36).slice(-10) + "A1!";
}

export async function deleteUser(userId: string): Promise<UserActionResult> {
  const admin = await isAdmin();
  if (!admin) return { success: false, error: "Acesso negado" };

  const currentUser = await getUser();
  if (currentUser?.id === userId) {
    return { success: false, error: "Não pode eliminar a si próprio." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) return { success: false, error: error.message };

  await createAuditLog({
    userId: currentUser?.id ?? "unknown",
    userEmail: currentUser?.email,
    action: "DELETE",
    entity: "Utilizador",
    entityId: userId,
  });

  revalidatePath("/utilizadores");
  return { success: true, message: "Utilizador eliminado com sucesso." };
}
