'use client';

import { Card, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import styles from './page.module.css';

const { Title, Paragraph } = Typography;

export default function AppMainPage() {
  const t = useTranslations('MainPage');

  const isAuthenticated = false;
  const userName = 'User';

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Card className={styles['welcome-card']}>
          {isAuthenticated ? (
            <>
              <Title level={2} className={styles['welcome-title']}>
                {t('welcomeBack', { name: userName })}
              </Title>
              <Paragraph>{t('welcomeBackDescription')}</Paragraph>
            </>
          ) : (
            <>
              <Title level={2} className={styles['welcome-title']}>
                {t('welcome')}
              </Title>
              <Paragraph>{t('welcomeDescription')}</Paragraph>
            </>
          )}
        </Card>
      </section>

      <section className={styles['info-sections']}>
        <article className={styles.section}>
          <Title level={3}>{t('developersHeader')}</Title>
          <Paragraph>{t('developersDescription')}</Paragraph>
        </article>

        <article className={styles.section}>
          <Title level={3}>{t('projectHeader')}</Title>
          <Paragraph>{t('projectDescription')}</Paragraph>
        </article>

        <article className={styles.section}>
          <Title level={3}>{t('courseHeader')}</Title>
          <Paragraph>{t('courseDescription')}</Paragraph>
        </article>
      </section>
    </div>
  );
}
