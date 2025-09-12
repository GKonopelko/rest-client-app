'use client';

import styles from './SignUpPage.module.css';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();

  return (
    <>
      <div className={styles.page}>Sign Up Page</div>
      <Button
        type="primary"
        size="large"
        onClick={() => router.push('/sign-in')}
      >
        OR Sign In
      </Button>
    </>
  );
}
