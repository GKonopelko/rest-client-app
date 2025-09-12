'use client';

import styles from './SignInPage.module.css';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();

  return (
    <>
      <div className={styles.page}>Sign In Page</div>
      <Button
        type="primary"
        size="large"
        onClick={() => router.push('/sign-up')}
      >
        OR Sign Up
      </Button>
    </>
  );
}
