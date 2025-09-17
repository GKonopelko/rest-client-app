'use client';

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

export default function LegacyRestClientPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (params?.params) {
      const newPath = `/api-client/${(params.params as string[]).join('/')}`;
      const queryString = searchParams.toString();
      const fullPath = queryString ? `${newPath}?${queryString}` : newPath;

      router.replace(fullPath);
    } else {
      router.replace('/api-client/GET');
    }
  }, [params, searchParams, router]);

  return (
    <div
      style={{
        padding: '20px',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <p>Redirecting to new API client interface...</p>
    </div>
  );
}
