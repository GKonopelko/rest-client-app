'use client';

import Link from 'next/link';
import styles from './styles.module.css';
import { Button, Space, Grid } from 'antd';
import {
  LoginOutlined,
  UserAddOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { Logo } from '../../components/Logo/Logo';
import { useScrollDetection } from '../../hooks/useScrollDetection';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useSwitchLocale } from '@/hooks/useSwitchLocale';

const { useBreakpoint } = Grid;

const LANGUAGES = {
  en: 'en',
  ru: 'ru',
};

export default function Header() {
  const screens = useBreakpoint();
  const isScrolled = useScrollDetection();
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('AppLayout');
  const currentLocale =
    typeof params?.locale === 'string' ? params.locale : 'en';

  const switchLocale = useSwitchLocale();
  const showText = screens.md;

  const handleLocaleSwitch = (targetLocale: string) => {
    switchLocale(currentLocale, targetLocale);
  };

  return (
    <header
      className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}
      role="banner"
    >
      <Link href="/" className={styles['logo-link']}>
        <Logo />
      </Link>

      <div className={styles.container}>
        <Space.Compact>
          <Button
            type={currentLocale === LANGUAGES.en ? 'primary' : 'default'}
            onClick={() => handleLocaleSwitch('en')}
            icon={!showText ? <GlobalOutlined /> : undefined}
            aria-label={t('localeEn')}
            className={styles['locale-button']}
          >
            {showText ? t('localeEn') : ''}
          </Button>
          <Button
            type={currentLocale === LANGUAGES.ru ? 'primary' : 'default'}
            onClick={() => handleLocaleSwitch('ru')}
            icon={!showText ? <GlobalOutlined /> : undefined}
            aria-label={t('localeRu')}
            className={styles['locale-button']}
          >
            {showText ? t('localeRu') : ''}
          </Button>
        </Space.Compact>

        <Button
          type="default"
          icon={<LoginOutlined />}
          aria-label={t('signInButton')}
          className={styles['sign-in-button']}
          onClick={() => router.push('/sign-in')}
        >
          {showText ? t('signInButton') : ''}
        </Button>

        <Button
          type="primary"
          icon={<UserAddOutlined />}
          aria-label={t('signUpButton')}
          onClick={() => router.push('/sign-up')}
        >
          {showText ? t('signUpButton') : ''}
        </Button>
      </div>
    </header>
  );
}
