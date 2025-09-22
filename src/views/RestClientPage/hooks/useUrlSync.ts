import { useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { encodeRequestToUrl } from '@/utils/urlEncoding';
import { RequestData } from '@/views/RestClientPage/types';
import { useLocale } from 'next-intl';

export const useUrlSync = () => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const lastLocaleRef = useRef(locale);

  const updateUrl = useCallback(
    (request: RequestData) => {
      if (lastLocaleRef.current !== locale) {
        lastLocaleRef.current = locale;
        return;
      }

      const newUrl = encodeRequestToUrl(
        request.method,
        request.url,
        request.headers,
        request.body,
        locale
      );

      if (pathname !== newUrl) {
        router.replace(newUrl, { scroll: false });
      }
    },
    [router, pathname, locale]
  );

  return { updateUrl };
};
