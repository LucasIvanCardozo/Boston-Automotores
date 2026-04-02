import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, ADMIN_COOKIE_OPTIONS } from '@/lib/auth'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public login page without auth check
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Protect all other /admin/* routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(ADMIN_COOKIE_OPTIONS.name)?.value

    if (!token) {
      // No token - redirect to login
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Verify token
    const payload = verifyToken(token)
    if (!payload) {
      // Invalid token - redirect to login
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete(ADMIN_COOKIE_OPTIONS.name)
      return response
    }

    // Token valid - allow request
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
