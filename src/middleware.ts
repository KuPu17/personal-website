import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/blog',
    '/api/blog/:path*',
    '/api/projects',
    '/api/projects/:path*',
    '/api/journal/:path*',
    '/api/upload/:path*',
    '/api/messages/manage/:path*',
    '/api/canvas-blocks/manage',
    '/api/canvas-blocks/manage/:path*',
    '/api/site-settings',
    '/api/visits/stats',
  ],
};

function isPublicApi(pathname: string, method: string): boolean {
  if (method === 'GET' && pathname === '/api/site-settings') {
    return true;
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicApi(pathname, request.method)) {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(request);

  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-webos-owner', 'true');

  return NextResponse.next({ request: { headers: requestHeaders } });
}
