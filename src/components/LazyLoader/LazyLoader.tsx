'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { LoadingOutlined } from '@ant-design/icons';
import styles from './LazyLoader.module.css';

export function GlobalLoading({
  message = 'Loading...',
  size = 48,
}: {
  message?: string;
  size?: number;
}) {
  console.log('GlobalLoading rendered:', message);
  return (
    <div className={styles.container}>
      <LoadingOutlined className={styles.icon} style={{ fontSize: size }} />
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}

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
    loading: () => <GlobalLoading message={loadingMessage} size={size} />,
    ssr: true,
  });

  return (
    <Suspense
      fallback={<GlobalLoading message={suspenseMessage} size={size} />}
    >
      <LazyComponent />
    </Suspense>
  );
}
