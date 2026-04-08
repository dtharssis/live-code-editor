import NextAuth from 'next-auth';
import { authConfigEdge } from '@/infrastructure/auth/authConfig.edge';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfigEdge);

const PROTECTED = ['/dashboard', '/editor', '/ai-builder', '/drafts'];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected  = PROTECTED.some(p => pathname.startsWith(p));

  if (isProtected && !req.auth) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
