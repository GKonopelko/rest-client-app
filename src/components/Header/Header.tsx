'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import { Button, Space, Grid } from 'antd';
import {
  LoginOutlined,
  UserAddOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { Logo } from '@/components/Logo/Logo';
import { useScrollDetection } from '../../hooks/useScrollDetection';

const { useBreakpoint } = Grid;

const LANGUAGES = {
  EN: 'en',
  RU: 'ru',
} as const;

type Language = (typeof LANGUAGES)[keyof typeof LANGUAGES];

export default function Header() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    LANGUAGES.EN
  );
  const screens = useBreakpoint();
  const isScrolled = useScrollDetection(10);

  const handleLanguageChange = useCallback((language: Language) => {
    setCurrentLanguage(language);
  }, []);

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
            type={currentLanguage === LANGUAGES.EN ? 'primary' : 'default'}
            onClick={() => {
              handleLanguageChange(LANGUAGES.EN);
            }}
            icon={!showText ? <GlobalOutlined /> : undefined}
            aria-label="English"
          >
            {showText ? 'EN' : ''}
          </Button>
          <Button
            type={currentLanguage === LANGUAGES.RU ? 'primary' : 'default'}
            onClick={() => {
              handleLanguageChange(LANGUAGES.RU);
            }}
            icon={!showText ? <GlobalOutlined /> : undefined}
            aria-label="Russian"
          >
            {showText ? 'RU' : ''}
          </Button>
        </Space.Compact>

        <Button
          type="default"
          icon={<LoginOutlined />}
          aria-label="Sign In"
          className={styles.signInButton}
        >
          {showText ? 'Sign In' : ''}
        </Button>
        <Button type="primary" icon={<UserAddOutlined />} aria-label="Sign Up">
          {showText ? 'Sign Up' : ''}
        </Button>
      </div>
    </header>
  );
}
