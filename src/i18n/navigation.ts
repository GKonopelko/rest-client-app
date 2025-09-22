import createMiddleware from 'next-intl/middleware';
import { routing } from './routing';
import { createNavigation } from 'next-intl/navigation';

export default createMiddleware(routing);

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
