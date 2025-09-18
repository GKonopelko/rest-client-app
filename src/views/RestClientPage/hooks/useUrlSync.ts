import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { encodeRequestToUrl } from '@/utils/urlEncoding';
import { RequestData } from '../types';

export const useUrlSync = (locale: string = 'en') => {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRequestRef = useRef<string>('');
  const isUpdatingFromUrl = useRef(false);

  const updateUrl = useCallback(
    (request: RequestData) => {
      if (isUpdatingFromUrl.current) {
        isUpdatingFromUrl.current = false;
        return;
      }

      const currentRequest = JSON.stringify({
        method: request.method,
        url: request.url,
        body: request.body,
        headers: request.headers,
      });

      if (lastRequestRef.current === currentRequest) {
        return;
      }

      lastRequestRef.current = currentRequest;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        try {
          const newUrl = encodeRequestToUrl(
            request.method,
            request.url,
            request.headers,
            request.body,
            locale
          );

          const currentUrl = window.location.pathname + window.location.search;
          if (newUrl !== currentUrl) {
            isUpdatingFromUrl.current = true;
            router.replace(newUrl, { scroll: false });
          }
        } catch (error) {
          console.error('Error updating URL:', error);
        }
      }, 800);
    },
    [router, locale]
  );

  return { updateUrl };
};
