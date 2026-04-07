import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Rotas públicas — não precisa de auth
  const publicRoutes = ['/', '/login', '/cadastro', '/onboarding']
  if (publicRoutes.some((r) => pathname.startsWith(r))) return res

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Verifica sessão
  const { data: { user } } = await supabase.auth.getUser()

  // Não logado → manda pro login
  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Verifica onboarding completo
  const { data: perfil } = await supabase
    .from('perfil')
    .select('onboarding_completo')
    .eq('id', user.id)
    .single()

  // Não completou onboarding → manda pro /onboarding
  if (!perfil?.onboarding_completo && pathname !== '/onboarding') {
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
