'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { LoadingOutlined } from '@ant-design/icons';
import styles from './loading.module.css';

const VariablesPage = dynamic(
  () => import('@/views/VariablesPage/VariablesPage'),
  {
    loading: () => (
      <div className={styles['loading-container']}>
        <LoadingOutlined className={styles['loadinging-icon']} />
      </div>
    ),
    ssr: false,
  }
);

export default function AppVariablesPage() {
  return <VariablesPage />;
}
