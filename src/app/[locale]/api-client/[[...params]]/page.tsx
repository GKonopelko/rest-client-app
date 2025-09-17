'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RestClientPage from '@/views/RestClientPage/RestClientPage';

export default function ApiClientPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    console.log('API Client page mounted with params:', params);
  }, [params, router]);

  return <RestClientPage />;
}
