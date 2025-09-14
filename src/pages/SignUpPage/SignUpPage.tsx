import { RegisterForm } from '@/components/RegisterForm/RegisterForm';
import styles from './SignUpPage.module.css';

export default function SignUpPage() {
  return (
    <div className={styles.page}>
      <section className={styles.content}>
        <h1>Sign Up</h1>
        <RegisterForm />
      </section>
    </div>
  );
}
