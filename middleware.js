import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  // Public routes (login and register)
  const publicRoutes = ['/', '/register'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // API routes should not be protected by this middleware
  const isApiRoute = pathname.startsWith('/api');

  // If accessing protected route without token, redirect to login
  if (!isPublicRoute && !isApiRoute && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If has token and tries to access login, redirect to dashboard
  if (pathname === '/' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth/login|api/auth/register).*)',
  ],
};