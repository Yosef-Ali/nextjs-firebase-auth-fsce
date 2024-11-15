import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that require authentication
const protectedPaths = ['/dashboard', '/posts'];
// Paths that are public
const publicPaths = ['/sign-in', '/sign-up'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Get the session cookie
  const sessionCookie = request.cookies.get('session');

  try {
    if (isProtectedPath) {
      if (!sessionCookie?.value) {
        console.log('No session cookie found, redirecting to sign-in');
        return redirectToSignIn(request);
      }

      // Verify the session
      const response = await fetch(`${request.nextUrl.origin}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionCookie: sessionCookie.value }),
      });

      const data = await response.json();

      if (!response.ok || !data.isValid) {
        console.log('Session invalid, redirecting to sign-in');
        return redirectToSignIn(request);
      }

      // Session is valid, allow access
      return NextResponse.next();
    }

    // Handle public paths (sign-in, sign-up)
    if (isPublicPath && sessionCookie?.value) {
      // If user is already signed in, redirect to dashboard
      const response = await fetch(`${request.nextUrl.origin}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionCookie: sessionCookie.value }),
      });

      const data = await response.json();

      if (response.ok && data.isValid) {
        return redirectToDashboard(request);
      }
    }

    // Allow access to all other paths
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, redirect to sign-in for protected paths
    if (isProtectedPath) {
      return redirectToSignIn(request);
    }
    return NextResponse.next();
  }
}

function redirectToSignIn(request: NextRequest) {
  const redirectUrl = new URL('/sign-in', request.url);
  // Add the original URL as a redirect parameter
  redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(redirectUrl);
}

function redirectToDashboard(request: NextRequest) {
  return NextResponse.redirect(new URL('/dashboard', request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
