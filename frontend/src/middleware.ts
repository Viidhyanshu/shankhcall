import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('session_token')?.value;
  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const isProtectedPath =
    pathname.startsWith('/select') || pathname.startsWith('/disaster');

  // Auth route (login/signup page)
  const isAuthPath = pathname === '/';

  
  if (isProtectedPath && !sessionToken) {
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }

  
  if (isAuthPath && sessionToken) {
    const selectUrl = new URL('/select', request.url);
    return NextResponse.redirect(selectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
   
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
