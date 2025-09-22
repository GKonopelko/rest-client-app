'use client';

import styles from './RegisterForm.module.css';
import { Button, Form, Input } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { app } from '@/lib/firebase/firebase';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegisterSchema } from '@/lib/zod/registerChema';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

type FormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const RegisterForm = () => {
  const router = useRouter();
  const t = useTranslations('SignUpPage');
  const registerSchema = useRegisterSchema();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
    resolver: zodResolver(registerSchema),
  });

  const submit = async (data: FormValues) => {
    const fireAuth = getAuth(app);

    try {
      const { user } = await createUserWithEmailAndPassword(
        fireAuth,
        data.email,
        data.password
      );

      await updateProfile(user, { displayName: data.name });
      await user.reload();

      const token = await user.getIdToken();

      await fetch('/api/setToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      router.push('/');
    } catch (error) {
      const err = error as FirebaseError;

      if (err.code === 'auth/email-already-in-use') {
        setError('email', {
          type: 'manual',
          message: t('emailAlreadyInUse'),
        });
        return;
      } else {
        console.error(error);
      }
    }
  };

  return (
    <Form
      layout="vertical"
      className={styles.form}
      onFinish={handleSubmit(submit)}
    >
      <Form.Item
        label={<span className={styles.label}>{t('nameField')}</span>}
        validateStatus={errors.name ? 'error' : ''}
        help={errors.name?.message}
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input placeholder={t('namePlaceholder')} {...field} />
          )}
        />
      </Form.Item>

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

      <Form.Item
        label={
          <span className={styles.label}>{t('confirmPasswordField')}</span>
        }
        validateStatus={errors.confirmPassword ? 'error' : ''}
        help={errors.confirmPassword?.message}
      >
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <Input.Password
              placeholder={t('confirmPasswordPlaceholder')}
              {...field}
            />
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
