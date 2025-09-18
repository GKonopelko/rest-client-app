import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const protectedRoutes = ['/rest-client', '/history', '/variables'];

const authPages = ['/sign-in', '/sign-up'];

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  if (pathname === '/') {
    const url = req.nextUrl.clone();

    url.pathname = '/en';
    return NextResponse.redirect(url);
  }

  const pathnameHasLocale = routing.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const locale = 'en';
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  const pathLocale = routing.locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  const locale = pathLocale || 'en';

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(`/${locale}${route}`)
  );

  if (isProtectedRoute && !token) {
    const loginUrl = new URL(`/${locale}/sign-in`, req.url);
    return NextResponse.redirect(loginUrl);
  }

  const isAuthPage = authPages.some((page) =>
    pathname.startsWith(`/${locale}${page}`)
  );

  if (isAuthPage && token) {
    const homeUrl = new URL(`/${locale}`, req.url);
    return NextResponse.redirect(homeUrl);
  }

  return createMiddleware(routing)(req);
}

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
