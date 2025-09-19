'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import LoadingState from './LoadingState';

interface LazyLoaderProps {
  component: 'RestClientPage' | 'VariablesPage' | 'HistoryPage';
  loadingMessage?: string;
  suspenseMessage?: string;
  size?: number;
}

const componentImporters = {
  RestClientPage: () => import('@/views/RestClientPage/RestClientPage'),
  VariablesPage: () => import('@/views/VariablesPage/VariablesPage'),
  HistoryPage: () => import('@/views/HistoryPage/HistoryPage'),
};

export default function LazyLoader({
  component,
  loadingMessage = 'Loading component...',
  suspenseMessage = 'Initializing...',
  size = 48,
}: LazyLoaderProps) {
  const LazyComponent = dynamic(componentImporters[component], {
    loading: () => <LoadingState message={loadingMessage} size={size} />,
    ssr: true,
  });

  return (
    <Suspense fallback={<LoadingState message={suspenseMessage} size={size} />}>
      <LazyComponent />
    </Suspense>
  );
}
