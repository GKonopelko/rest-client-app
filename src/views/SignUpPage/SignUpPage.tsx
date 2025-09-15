'use client';

import { RegisterForm } from '@/components/RegisterForm/RegisterForm';
import { useTranslations } from 'next-intl';
import styles from './SignUpPage.module.css';

export default function SignUpPage() {
  const t = useTranslations('SignUpPage');
  return (
    <div className={styles.page}>
      <section className={styles.content}>
        <h1>{t('title')}</h1>
        <RegisterForm />
      </section>
    </div>
  );
}
