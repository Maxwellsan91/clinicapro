"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { loginAction, type AuthActionResult } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const initialState: AuthActionResult | null = null;

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPass, setShowPass] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  return (
    <form action={formAction} className="space-y-5">

      {/* Erro global */}
      {state && !state.success && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700 animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <span className="leading-snug">{state.error}</span>
        </div>
      )}

      {/* E-mail */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          E-mail
        </Label>
        <div className={cn(
          "relative flex items-center rounded-xl border bg-white transition-all duration-200",
          emailFocused
            ? "border-blue-500 ring-3 ring-blue-500/10"
            : "border-gray-200 hover:border-gray-300"
        )}>
          <Mail className={cn(
            "absolute left-3.5 w-4 h-4 transition-colors duration-200 pointer-events-none",
            emailFocused ? "text-blue-500" : "text-gray-400"
          )} />
          <Input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="utilizador@exemplo.pt"
            required
            disabled={isPending}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            className="h-11 pl-10 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none placeholder:text-gray-400 text-gray-900"
          />
        </div>
      </div>

      {/* Palavra-passe */}
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Palavra-passe
        </Label>
        <div className={cn(
          "relative flex items-center rounded-xl border bg-white transition-all duration-200",
          passFocused
            ? "border-blue-500 ring-3 ring-blue-500/10"
            : "border-gray-200 hover:border-gray-300"
        )}>
          <Lock className={cn(
            "absolute left-3.5 w-4 h-4 transition-colors duration-200 pointer-events-none",
            passFocused ? "text-blue-500" : "text-gray-400"
          )} />
          <Input
            id="password"
            name="password"
            type={showPass ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            required
            disabled={isPending}
            onFocus={() => setPassFocused(true)}
            onBlur={() => setPassFocused(false)}
            className="h-11 pl-10 pr-10 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none placeholder:text-gray-400 text-gray-900"
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            disabled={isPending}
            className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            tabIndex={-1}
            aria-label={showPass ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
          >
            {showPass
              ? <EyeOff className="h-4 w-4" />
              : <Eye className="h-4 w-4" />
            }
          </button>
        </div>
      </div>

      {/* Botão */}
      <div className="pt-1">
        <Button
          type="submit"
          className="w-full h-11 text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm transition-all duration-150"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              A entrar...
            </>
          ) : (
            "Entrar na plataforma"
          )}
        </Button>
      </div>

    </form>
  );
}
