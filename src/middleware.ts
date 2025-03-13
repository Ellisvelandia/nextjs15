import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Create a Supabase client
  const supabase = createMiddlewareClient({ req, res });
  
  // Get the user's session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Protected paths that require authentication
  const protectedPaths = [
    '/dashboard',
    '/clients',
    '/products',
    '/vendors',
    '/transactions',
    '/settings',
  ];
  
  // Authentication-only paths
  const authPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
  ];
  
  const path = req.nextUrl.pathname;
  
  // Check if the path is protected and user is not authenticated
  if (protectedPaths.some(p => path.startsWith(p)) && !session) {
    const redirectUrl = new URL('/auth/login', req.url);
    // Add the original URL as a query parameter to redirect after login
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Redirect authenticated users away from auth pages
  if (authPaths.some(p => path === p) && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  return res;
}

// Specify which paths this middleware should run on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.svg).*)',
  ],
}; 