'use client';

import { setUser } from '@/slices/userSlice';
import styles from './SignUpPage.module.css';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { app } from '@/firebase';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

type FormValues = {
  email: string;
  password: string;
};

export default function SignUpPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { register, handleSubmit } = useForm<FormValues>({
    mode: 'onChange',
  });

  const submit = (data: FormValues) => {
    const fireAuth = getAuth(app);
    createUserWithEmailAndPassword(fireAuth, data.email, data.password)
      .then(({ user }) => {
        console.log(user);
        dispatch(
          setUser({
            email: user.email,
            id: user.uid,
            token: user.accessToken,
          })
        );
      })
      .catch(console.error);
  };

  return (
    <>
      <form className="form" onSubmit={handleSubmit(submit)} autoComplete="on">
        <div className={styles.page}>Sign Up Page</div>
        <Button
          type="primary"
          size="large"
          onClick={() => router.push('/sign-in')}
        >
          OR Sign In
        </Button>
        <label htmlFor="mail">Email</label>
        <input
          {...register('email')}
          id="mail"
          type="email"
          placeholder="Email"
        />
        <label htmlFor="password">Password</label>
        <input
          {...register('password')}
          id="password"
          type="password"
          placeholder="Password"
        />
        <Button htmlType="submit">Submit</Button>
      </form>
    </>
  );
}
