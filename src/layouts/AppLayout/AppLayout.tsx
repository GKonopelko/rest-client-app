'use client';

import styles from './AppLayout.module.css';
import React from 'react';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.content}>{children}</main>
      <Footer />
    </div>
  );
}
