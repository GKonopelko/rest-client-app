'use client';

import styles from './AppLayout.module.css';
import React from 'react';
import Footer from '../Footer/Footer';
import Header from '../Header/Header';

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
