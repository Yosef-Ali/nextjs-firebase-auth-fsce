import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get response headers
  const response = NextResponse.next()

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  )
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  )

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return response
  }

  return response
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    // Only run middleware on API routes
    '/api/:path*',
  ]
}
