"use client"

import Link from "next/link"
import { useActionState, useState } from "react"
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login, signup, type AuthState } from "@/app/auth/actions"

type Mode = "login" | "signup"

const copy = {
  login: {
    submit: "Sign In",
    switchText: "Don't have an account?",
    switchLabel: "Sign Up",
    switchHref: "/auth/signup",
  },
  signup: {
    submit: "Sign Up",
    switchText: "Already have an account?",
    switchLabel: "Sign In",
    switchHref: "/auth/login",
  },
}

export function AuthForm({ mode }: { mode: Mode }) {
  const t = copy[mode]
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    mode === "login" ? login : signup,
    {}
  )
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex w-full flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-2">
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="email"
            type="email"
            placeholder="Enter your email address"
            autoComplete="email"
            required
            className="h-10 pl-9"
          />
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={6}
            required
            className="h-10 px-9"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        {state.error && <p className="text-sm text-destructive" aria-live="polite">{state.error}</p>}
        {state.message && <p className="text-sm text-muted-foreground" aria-live="polite">{state.message}</p>}

        <Button type="submit" variant="gradient" disabled={pending} className="mt-2 h-10">
          {t.submit}
          <ArrowRight data-icon="inline-end" />
        </Button>
      </form>

      <p className="text-center text-muted-foreground">
        {t.switchText}{" "}
        <Link href={t.switchHref} className="font-semibold text-foreground underline">
          {t.switchLabel}
        </Link>
      </p>
    </div>
  )
}
