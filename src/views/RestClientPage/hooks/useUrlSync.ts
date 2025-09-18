import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { encodeRequestToUrl } from '@/utils/urlEncoding';
import { RequestData } from '../types';

export const useUrlSync = (locale: string = 'en') => {
  const router = useRouter();

  const updateUrl = useCallback(
    (request: RequestData) => {
      const newUrl = encodeRequestToUrl(
        request.method,
        request.url,
        request.headers,
        request.body,
        locale
      );
      router.replace(newUrl, { scroll: false });
    },
    [router, locale]
  );

  return { updateUrl };
};
