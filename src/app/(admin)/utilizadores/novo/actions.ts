"use server";

import { redirect } from "next/navigation";
import { inviteUser } from "@/features/auth/userActions";

export async function createUserAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();
  const role = (formData.get("role") as "admin" | "user") ?? "user";
  const jobTitle = (formData.get("jobTitle") as string)?.trim() ?? "";

  if (!email || !password) return;

  const result = await inviteUser(email, role, password, jobTitle);

  if (result.success) {
    redirect("/utilizadores?success=1");
  } else {
    redirect(`/utilizadores/novo?error=${encodeURIComponent(result.error)}`);
  }
}
