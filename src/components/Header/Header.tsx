'use client';

import Link from 'next/link';
import styles from './styles.module.css';
import { Button, Grid } from 'antd';
import {
  LoginOutlined,
  UserAddOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Logo } from '../../components/Logo/Logo';
import { useScrollDetection } from '../../hooks/useScrollDetection';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { removeUser, selectUserName } from '@/slices/userSlice';
import { RootState } from '@/store';
import { getAuth, signOut } from 'firebase/auth';
import LanguageSwitcher from '@/components/LanguageSwitcher/LanguageSwitcher';

const { useBreakpoint } = Grid;

export default function Header() {
  const screens = useBreakpoint();
  const isScrolled = useScrollDetection();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const userName = useSelector((state: RootState) => selectUserName(state));
  const t = useTranslations('AppLayout');
  const showText = screens.md;

  const handleSignOut = async () => {
    const auth = getAuth();

    try {
      await signOut(auth);
      dispatch(removeUser());

      await fetch('/api/setToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: '' }),
      });

      if (pathname === '/') {
        router.replace('/');
        return;
      }

      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
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
        <LanguageSwitcher showText={showText} />

        {userName ? (
          <Button
            type="primary"
            icon={<LogoutOutlined />}
            aria-label={t('signOutButton')}
            onClick={handleSignOut}
          >
            {showText ? t('signOutButton') : ''}
          </Button>
        ) : (
          <>
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
          </>
        )}
      </div>
    </header>
  );
}
