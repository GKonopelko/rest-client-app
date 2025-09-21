import styles from './NotFoundPage.module.css';
import Image from 'next/image';

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <Image
        src="/assets/images/not-found.webp"
        alt="404 Not found"
        width={200}
        height={200}
      />
      <h1>Not Found Page</h1>
    </div>
  );
}
