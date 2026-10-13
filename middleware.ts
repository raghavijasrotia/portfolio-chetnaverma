import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  // Legacy redirect if someone enters rj-admin-portfolio
  if (request.nextUrl.pathname.startsWith('/rj-admin-portfolio')) {
    const newPath = request.nextUrl.pathname.replace('/rj-admin-portfolio', '/chetna-admin-portfolio');
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // Handle admin routes
  if (request.nextUrl.pathname.startsWith('/chetna-admin-portfolio')) {
    const session = await getSession(request);

    // If user is already logged in and visits login page, redirect to admin dashboard
    if (request.nextUrl.pathname === '/chetna-admin-portfolio/login') {
      if (session) {
        return NextResponse.redirect(new URL('/chetna-admin-portfolio', request.url));
      }
      return NextResponse.next();
    }

    // If no valid session, redirect to login
    if (!session) {
      const loginUrl = new URL('/chetna-admin-portfolio/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Also protect API routes that change data
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/chetna-admin-portfolio/:path*', '/rj-admin-portfolio/:path*', '/api/admin/:path*'],
};
