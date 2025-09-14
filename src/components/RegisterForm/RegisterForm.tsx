'use client';

import { setUser } from '@/slices/userSlice';
import styles from './RegisterForm.module.css';
import { Button, Form, Input } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { app } from '@/lib/firebase/firebase';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { authSchema } from '@/lib/zod/authChema';

type FormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

export const RegisterForm = () => {
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
    resolver: zodResolver(authSchema),
  });

  const submit = async (data: FormValues) => {
    const fireAuth = getAuth(app);

    try {
      const { user } = await createUserWithEmailAndPassword(
        fireAuth,
        data.email,
        data.password
      );

      const token = await user.getIdToken();

      dispatch(
        setUser({
          email: user.email || '',
          id: user.uid,
          token: token,
        })
      );
    } catch (error) {
      console.error(error);
    }
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

      <Form.Item
        label={<span className={styles.label}>Confirm Password</span>}
        validateStatus={errors.confirmPassword ? 'error' : ''}
        help={errors.confirmPassword?.message}
      >
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <Input.Password placeholder="Confirm password" {...field} />
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
