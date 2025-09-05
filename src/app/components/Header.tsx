'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './header.module.css';
import { Button, Space, Grid } from 'antd';
import {
  LoginOutlined,
  UserAddOutlined,
  GlobalOutlined,
} from '@ant-design/icons';

const { useBreakpoint } = Grid;

export default function Header() {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isScrolled, setIsScrolled] = useState(false);
  const screens = useBreakpoint();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
  };

  const showText = !screens.xs;

  return (
    <header
      className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}
      role="banner"
    >
      <Link href="/" className={styles.logoLink}>
        <svg width="180" height="60" viewBox="0 0 200 60">
          <text x="5" y="35" fontSize="24" fontWeight="700" fill="#10B981">
            REST SPB
          </text>
        </svg>
      </Link>

      <div className={styles.container}>
        <Space.Compact>
          <Button
            type={currentLanguage === 'en' ? 'primary' : 'default'}
            onClick={() => {
              handleLanguageChange('en');
            }}
            icon={!showText ? <GlobalOutlined /> : undefined}
          >
            {showText ? 'EN' : ''}
          </Button>
          <Button
            type={currentLanguage === 'ru' ? 'primary' : 'default'}
            onClick={() => {
              handleLanguageChange('ru');
            }}
            icon={!showText ? <GlobalOutlined /> : undefined}
          >
            {showText ? 'RU' : ''}
          </Button>
        </Space.Compact>

        <Button
          type="default"
          icon={<LoginOutlined />}
          className={styles.signInButton}
        >
          {showText ? 'Sign In' : ''}
        </Button>
        <Button type="primary" icon={<UserAddOutlined />}>
          {showText ? 'Sign Up' : ''}
        </Button>
      </div>
    </header>
  );
}
