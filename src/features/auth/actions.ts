"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A palavra-passe deve ter pelo menos 6 caracteres"),
});

export type AuthActionResult =
  | { success: true }
  | { success: false; error: string };

export async function loginAction(
  _prev: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const raw = {
    email:    formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = loginSchema.safeParse(raw);
  if (!result.success) {
    const first = Object.values(result.error.flatten().fieldErrors).flat()[0];
    return { success: false, error: first ?? "Dados inválidos" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email:    result.data.email,
    password: result.data.password,
  });

  if (error) {
    if (error.code === "invalid_credentials") {
      return { success: false, error: "E-mail ou palavra-passe incorrectos." };
    }
    if (error.code === "email_not_confirmed") {
      return { success: false, error: "Por favor confirme o seu e-mail antes de entrar." };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/** Returns "admin" | "user". Defaults to "user" if not set. */
export async function getUserRole(): Promise<"admin" | "user"> {
  const user = await getUser();
  const role = user?.user_metadata?.role as string | undefined;
  return role === "admin" ? "admin" : "user";
}

export async function isAdmin(): Promise<boolean> {
  return (await getUserRole()) === "admin";
}

