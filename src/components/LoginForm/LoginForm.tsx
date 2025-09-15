'use client';

import styles from './LoginForm.module.css';
import { Button, Form, Input } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { app } from '@/lib/firebase/firebase';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLoginSchema } from '@/lib/zod/loginSchema';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

type FormValues = {
  email: string;
  password: string;
};

export const LoginForm = () => {
  const t = useTranslations('SignInPage');
  const router = useRouter();
  const loginSchema = useLoginSchema();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
    resolver: zodResolver(loginSchema),
  });

  const submit = async (data: FormValues) => {
    const fireAuth = getAuth(app);
    const { user } = await signInWithEmailAndPassword(
      fireAuth,
      data.email,
      data.password
    );

    const token = await user.getIdToken();

    await fetch('/api/setToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    router.push('/');
  };

  return (
    <Form
      layout="vertical"
      className={styles.form}
      onFinish={handleSubmit(submit)}
    >
      <Form.Item
        label={<span className={styles.label}>{t('emailField')}</span>}
        validateStatus={errors.email ? 'error' : ''}
        help={errors.email?.message}
      >
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input placeholder={t('emailPlaceholder')} {...field} />
          )}
        />
      </Form.Item>

      <Form.Item
        label={<span className={styles.label}>{t('passwordField')}</span>}
        validateStatus={errors.password ? 'error' : ''}
        help={errors.password?.message}
      >
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input.Password placeholder={t('passwordPlaceholder')} {...field} />
          )}
        />
      </Form.Item>

      <Form.Item className={styles.field}>
        <Button htmlType="submit" type="primary" disabled={!isValid}>
          {t('submitButton')}
        </Button>
      </Form.Item>
    </Form>
  );
};
