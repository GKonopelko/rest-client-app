import { useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export const useSwitchLocale = () => {
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = useCallback(
    (currentLocale: string, targetLocale?: string) => {
      const newLocale = targetLocale || (currentLocale === 'en' ? 'ru' : 'en');
      const newPath =
        pathname?.replace(`/${currentLocale}`, `/${newLocale}`) || '/';
      router.push(newPath);
    },
    [pathname, router]
  );

  return switchLocale;
};
