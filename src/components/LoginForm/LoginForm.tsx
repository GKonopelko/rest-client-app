'use client';

import styles from './LoginForm.module.css';
import { Button, Form, Input } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { app } from '@/lib/firebase/firebase';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/zod/loginSchema';
import { useRouter } from 'next/navigation';

type FormValues = {
  email: string;
  password: string;
};

export const LoginForm = () => {
  const router = useRouter();
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
        label={<span className={styles.label}>Email</span>}
        validateStatus={errors.email ? 'error' : ''}
        help={errors.email?.message}
      >
        <Controller
          name="email"
          control={control}
          render={({ field }) => <Input placeholder="Enter email" {...field} />}
        />
      </Form.Item>

      <Form.Item
        label={<span className={styles.label}>Password</span>}
        validateStatus={errors.password ? 'error' : ''}
        help={errors.password?.message}
      >
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input.Password placeholder="Enter password" {...field} />
          )}
        />
      </Form.Item>

      <Form.Item className={styles.field}>
        <Button htmlType="submit" type="primary" disabled={!isValid}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};
