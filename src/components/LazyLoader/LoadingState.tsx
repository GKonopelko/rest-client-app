'use client';

import React from 'react';
import { Card, Spin } from 'antd';
import styles from './LoadingState.module.css';

interface LoadingStateProps {
  message?: string;
  size?: number;
  className?: string;
}

export default function LoadingState({
  message = 'Loading...',
  className = '',
}: LoadingStateProps) {
  return (
    <section className={`${styles.section} ${className}`}>
      <Card className={styles.card}>
        <div className={styles['loading-container']}>
          <Spin size="large" />
          {message && <p className={styles.message}>{message}</p>}
        </div>
      </Card>
    </section>
  );
}
