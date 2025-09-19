'use client';

import { useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

export const useSwitchLocale = () => {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const switchLocale = useCallback(
    (targetLocale: string) => {
      const currentState = {
        scrollY: window.scrollY,
      };

      let newPath = pathname || '/';

      if (pathname && pathname.startsWith(`/${currentLocale}`)) {
        newPath = pathname.replace(`/${currentLocale}`, `/${targetLocale}`);
      } else {
        newPath = `/${targetLocale}${pathname}`;
      }

      document.cookie = `NEXT_LOCALE=${targetLocale}; max-age=${365 * 24 * 60 * 60}; path=/`;

      router.push(newPath);

      setTimeout(() => {
        window.scrollTo(0, currentState.scrollY);
      }, 100);
    },
    [pathname, router, currentLocale]
  );

  return switchLocale;
};
