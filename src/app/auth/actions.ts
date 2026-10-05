"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export type AuthState = { error?: string; message?: string }

function getCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  }
}

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(getCredentials(formData))
  if (error) return { error: error.message }
  redirect("/")
}

export async function signup(_: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()
  const origin = (await headers()).get("origin")
  const { data, error } = await supabase.auth.signUp({
    ...getCredentials(formData),
    options: { emailRedirectTo: `${origin}/auth/callback` },
  })
  if (error) return { error: error.message }
  if (!data.session) return { message: "Check your email to confirm your account." }
  redirect("/")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}
