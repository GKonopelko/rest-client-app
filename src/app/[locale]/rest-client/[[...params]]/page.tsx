'use client';

import { useParams, useSearchParams } from 'next/navigation';
import RestClientPage from '@/views/RestClientPage/RestClientPage';
import { isValidBase64, decodeUnicodeFromBase64 } from '@/utils/urlEncoding';

export default function RestClientHandlerPage() {
  const params = useParams();
  const searchParams = useSearchParams();

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
        decodedHeaders[key] = value;
      }
    });
  }

  return (
    <RestClientPage
      initialMethod={method}
      initialUrl={decodedUrl}
      initialBody={decodedBody}
      initialHeaders={decodedHeaders}
    />
  );
}
