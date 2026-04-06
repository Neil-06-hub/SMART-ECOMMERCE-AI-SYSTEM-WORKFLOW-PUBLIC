import { NextResponse } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = ['/checkout', '/profile', '/orders', '/wishlist'];
// Routes that require admin role — checked in the admin layout itself
const ADMIN_ROUTES = ['/admin'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Read token from cookie (set by the client after login)
  const token = request.cookies.get('auth_token')?.value;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAdmin = ADMIN_ROUTES.some((r) => pathname.startsWith(r));

  if ((isProtected || isAdmin) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/checkout', '/profile', '/orders', '/wishlist', '/admin/:path*'],
};
