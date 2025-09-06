'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import { Button, Space, Grid } from 'antd';
import {
  LoginOutlined,
  UserAddOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { Logo } from '../../components/Logo/Logo';
import { useScrollDetection } from '../../hooks/useScrollDetection';
import { useTranslations } from 'next-intl';
import { useParams, usePathname, useRouter } from 'next/navigation';

const { useBreakpoint } = Grid;

const LANGUAGES = {
  en: 'en',
  ru: 'ru',
};

export default function Header() {
  const screens = useBreakpoint();
  const isScrolled = useScrollDetection(10);
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('AppLayout');
  const [currentLocale, setCurrentLocale] = useState(params?.locale || 'en');

  const switchLocale = () => {
    const newLocale = currentLocale === 'en' ? 'ru' : 'en';
    const newPath =
      pathname?.replace(`/${currentLocale}`, `/${newLocale}`) || '';

    router.push(newPath);
    setCurrentLocale(newLocale);
  };

  const showText = !screens.xs;

  return (
    <header
      className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}
      role="banner"
    >
      <Link href="/" className={styles.logoLink}>
        <Logo />
      </Link>

      <div className={styles.container}>
        <Space.Compact>
          <Button
            type={currentLocale === LANGUAGES.en ? 'primary' : 'default'}
            onClick={() => {
              switchLocale();
            }}
            icon={!showText ? <GlobalOutlined /> : undefined}
            aria-label="English"
          >
            {showText ? 'EN' : ''}
          </Button>
          <Button
            type={currentLocale === LANGUAGES.ru ? 'primary' : 'default'}
            onClick={() => {
              switchLocale();
            }}
            icon={!showText ? <GlobalOutlined /> : undefined}
            aria-label="Russian"
          >
            {showText ? 'RU' : ''}
          </Button>
        </Space.Compact>

        <Link href="/sign-in" className={styles.logoLink}>
          <Button
            type="default"
            icon={<LoginOutlined />}
            aria-label={t('signInButton')}
            className={styles.signInButton}
          >
            {showText ? t('signInButton') : ''}
          </Button>
        </Link>
        <Link href="/sign-up" className={styles.logoLink}>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            aria-label={t('signUpButton')}
          >
            {showText ? t('signUpButton') : ''}
          </Button>
        </Link>
      </div>
    </header>
  );
}
