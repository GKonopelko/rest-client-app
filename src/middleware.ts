import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const protectedRoutes = ['/rest-client', '/history', '/variables'];
const authPages = ['/sign-in', '/sign-up'];
const localePattern = /^\/(en|ru)/;

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;
  const pathnameWithoutLocale = pathname.replace(localePattern, '');

  const localeMatch = pathname.match(localePattern);
  const locale = localeMatch ? localeMatch[1] : 'en';

  if (
    protectedRoutes.some((route) => pathnameWithoutLocale.startsWith(route)) &&
    !token
  ) {
    const loginUrl = new URL(`/${locale}/sign-in`, req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (
    authPages.some((page) => pathnameWithoutLocale.startsWith(page)) &&
    token
  ) {
    const homeUrl = new URL(`/${locale}`, req.url);
    return NextResponse.redirect(homeUrl);
  }

  return createMiddleware(routing)(req);
}

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
