import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add paths that should be accessible without authentication
const publicPaths = ['/', '/sign-in', '/sign-up', '/resources'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow access to public paths
  if (publicPaths.includes(pathname) || pathname.startsWith('/resources/')) {
    return NextResponse.next();
  }

  // Get Firebase auth token from cookie
  const token = request.cookies.get('firebase-token');

  // Check if user is authenticated
  if (!token) {
    // Redirect to home page instead of sign-in
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

// Configure paths that should be protected by authentication
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/posts/:path*',
    '/media/:path*',
  ],
};
