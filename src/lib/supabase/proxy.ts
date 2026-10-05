import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { Database } from "@/lib/supabase/database.types"

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refreshes the auth token if expired. Don't put code between
  // createServerClient and this call.
  const { data } = await supabase.auth.getClaims()
  const isLoggedIn = !!data?.claims
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth")

  // Signed-out users can only reach /auth/*; signed-in users skip login/signup
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }
  if (isLoggedIn && isAuthPage && !request.nextUrl.pathname.startsWith("/auth/callback")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return response
}
