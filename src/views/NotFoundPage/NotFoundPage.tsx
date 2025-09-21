import Link from 'next/link';
import styles from './NotFoundPage.module.css';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function NotFoundPage() {
  const t = useTranslations('NotFoundPage');

  return (
    <div className={styles.page}>
      <Image
        src="/assets/images/not-found.webp"
        alt={t('imageHover')}
        width={200}
        height={200}
      />
      <h1>{t('title')}</h1>
      <h3>
        {t('annotation')}&nbsp;
        <Link href="/" style={{ textDecoration: 'underline' }}>
          {t('homeLink')}
        </Link>
      </h3>
    </div>
  );
}
