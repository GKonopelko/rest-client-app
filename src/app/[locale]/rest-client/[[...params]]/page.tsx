'use client';

import { useParams, useSearchParams } from 'next/navigation';
import RestClientPage from '@/views/RestClientPage/RestClientPage';
import { isValidBase64, decodeUnicodeFromBase64 } from '@/utils/urlEncoding';
import { useEffect, useState, useRef } from 'react';

interface InitialRequestData {
  initialMethod: string;
  initialUrl: string;
  initialBody: string;
  initialHeaders: Record<string, string>;
}

export default function RestClientHandlerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const initialDataRef = useRef<InitialRequestData | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || initialDataRef.current) return;

    const pathParts = (params.params as string[]) || [];
    const method = pathParts[0] || 'GET';
    const encodedUrl = pathParts[1];
    const encodedBody = pathParts[2];

    let decodedUrl = '';
    let decodedBody = '';
    const decodedHeaders: Record<string, string> = {};

    if (encodedUrl && isValidBase64(encodedUrl)) {
      try {
        decodedUrl = decodeUnicodeFromBase64(encodedUrl);
      } catch (error) {
        console.error('Error decoding URL:', error);
      }
    }

    if (encodedBody && isValidBase64(encodedBody)) {
      try {
        decodedBody = decodeUnicodeFromBase64(encodedBody);
      } catch (error) {
        console.error('Error decoding body:', error);
      }
    }

    if (searchParams) {
      searchParams.forEach((value, key) => {
        if (key && value) {
          try {
            decodedHeaders[key] = decodeURIComponent(value);
          } catch (error) {
            console.error(`Error decoding header ${key}:`, error);
            decodedHeaders[key] = value;
          }
        }
      });
    }

    initialDataRef.current = {
      initialMethod: method,
      initialUrl: decodedUrl,
      initialBody: decodedBody,
      initialHeaders: decodedHeaders,
    };
  }, [isClient, params.params, searchParams]);

  if (!isClient || !initialDataRef.current) {
    return (
      <RestClientPage
        initialMethod="GET"
        initialUrl=""
        initialBody=""
        initialHeaders={{}}
      />
    );
  }

  return (
    <RestClientPage
      initialMethod={initialDataRef.current.initialMethod}
      initialUrl={initialDataRef.current.initialUrl}
      initialBody={initialDataRef.current.initialBody}
      initialHeaders={initialDataRef.current.initialHeaders}
    />
  );
}
