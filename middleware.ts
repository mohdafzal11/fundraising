import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPageUrl } from './lib/utils';

export function middleware(request: NextRequest) {
  console.log(`Middleware handling path: ${request.nextUrl.pathname}`);

  if (request.nextUrl.pathname.includes('/admin/login')) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authToken = request.cookies.get('admin_token')?.value;
    console.log(`Auth token present: ${Boolean(authToken)}`);

    if (!authToken) {
      console.log('No auth token found, redirecting to login');
      return NextResponse.redirect(new URL(getPageUrl('/admin/login'), request.url));
    }

    try {
      const validToken = process.env.ADMIN_TOKEN_HASH;
      if (!validToken) {
        console.error('Missing ADMIN_TOKEN_HASH environment variable');
      }

      if (authToken !== validToken) {
        console.log('Invalid token, redirecting to login');
        return NextResponse.redirect(new URL(getPageUrl('/admin/login'), request.url));
      }

      console.log('Auth successful, proceeding to admin route');
    } catch (error) {
      console.error('Auth verification error:', error);
      return NextResponse.redirect(new URL(getPageUrl('/admin/login'), request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
  runtime: 'nodejs',
};