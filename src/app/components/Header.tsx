'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './header.module.css';
import { Button, Space } from 'antd';
import { LoginOutlined, UserAddOutlined } from '@ant-design/icons';

export default function Header() {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isScrolled, setIsScrolled] = useState(false);

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
    console.log('Language changed to:', language);
  };

  return (
    <header
      className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}
      role="banner"
      aria-label="Main header"
    >
      <Link href="/" className={styles.logoLink}>
        <svg
          width="200"
          height="60"
          viewBox="0 0 220 60"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.logoSvg}
        >
          <text x="5" y="35" fontSize="24" fontWeight="700" fill="#10B981">
            REST SPB
          </text>
        </svg>
      </Link>

      <Space>
        <Space.Compact>
          <Button
            type={currentLanguage === 'en' ? 'primary' : 'default'}
            onClick={() => {
              handleLanguageChange('en');
            }}
          >
            EN
          </Button>
          <Button
            type={currentLanguage === 'ru' ? 'primary' : 'default'}
            onClick={() => {
              handleLanguageChange('ru');
            }}
          >
            RU
          </Button>
        </Space.Compact>

        <Button
          type="default"
          icon={<LoginOutlined />}
          className={styles.signInButton}
        >
          Sign In
        </Button>
        <Button type="primary" icon={<UserAddOutlined />}>
          Sign Up
        </Button>
      </Space>
    </header>
  );
}
