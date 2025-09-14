import { LoginForm } from '@/components/LoginForm/LoginForm';
import styles from './SignInPage.module.css';

export default function SignUpPage() {
  return (
    <div className={styles.page}>
      <section className={styles.content}>
        <h1>Sign In</h1>
        <LoginForm />
      </section>
    </div>
  );
}
