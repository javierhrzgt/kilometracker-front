import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  // Si intenta acceder al dashboard o admin-users sin token, redirigir al login
  if ((pathname.startsWith('/dashboard') || pathname.startsWith('/admin-users')) && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Si tiene token e intenta acceder al login, redirigir al dashboard
  if (pathname === '/' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/admin-users/:path*'],
};