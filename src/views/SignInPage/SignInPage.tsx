'use client';

import { LoginForm } from '@/components/LoginForm/LoginForm';
import { useTranslations } from 'next-intl';
import styles from './SignInPage.module.css';

export default function SignUpPage() {
  const t = useTranslations('SignInPage');
  return (
    <div className={styles.page}>
      <section className={styles.content}>
        <h1>{t('title')}</h1>
        <LoginForm />
      </section>
    </div>
  );
}
