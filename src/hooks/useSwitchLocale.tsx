'use client';

import { useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export const useSwitchLocale = () => {
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = useCallback(
    (currentLocale: string, targetLocale?: string) => {
      const newLocale = targetLocale || (currentLocale === 'en' ? 'ru' : 'en');

      const currentState = {
        scrollY: window.scrollY,
      };

      const newPath =
        pathname?.replace(`/${currentLocale}`, `/${newLocale}`) || '/';

      document.cookie = `NEXT_LOCALE=${newLocale}; max-age=${365 * 24 * 60 * 60}; path=/`;

      router.push(newPath);

      setTimeout(() => {
        window.scrollTo(0, currentState.scrollY);
      }, 100);
    },
    [pathname, router]
  );

  return switchLocale;
};
