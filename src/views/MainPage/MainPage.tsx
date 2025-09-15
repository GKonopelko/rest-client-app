'use client';

import { Card, Typography, Button, Space } from 'antd';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import styles from './MainPage.module.css';
import { useSelector } from 'react-redux';
import { selectUserName } from '@/slices/userSlice';
import { RootState } from '@/store';

const { Title, Paragraph, Link: AntLink } = Typography;

export default function AppMainPage() {
  const t = useTranslations('MainPage');
  const router = useRouter();
  const userName = useSelector((state: RootState) => selectUserName(state));

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Card className={styles['welcome-card']}>
          {userName ? (
            <>
              <Title level={2} className={styles['welcome-title']}>
                {t('welcomeBack', { name: userName })}
              </Title>
              <Paragraph>{t('welcomeBackDescription')}</Paragraph>

              <Space size="middle" className={styles['action-buttons']}>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => router.push('/rest-client')}
                >
                  {t('restClient')}
                </Button>
                <Button
                  type="default"
                  size="large"
                  onClick={() => router.push('/history')}
                >
                  {t('history')}
                </Button>
                <Button
                  type="default"
                  size="large"
                  onClick={() => router.push('/variables')}
                >
                  {t('variables')}
                </Button>
              </Space>
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
          <Paragraph>
            {t('developersDescription')}
            <br />
            <AntLink href="https://github.com/sashapervykh" target="_blank">
              {t('developer1')}
            </AntLink>
            {', '}
            <AntLink href="https://github.com/Forlocks" target="_blank">
              {t('developer2')}
            </AntLink>
            {', '}
            <AntLink href="https://github.com/GKonopelko" target="_blank">
              {t('developer3')}
            </AntLink>
          </Paragraph>
        </article>

        <article className={styles.section}>
          <Title level={3}>{t('projectHeader')}</Title>
          <Paragraph>{t('projectDescription')}</Paragraph>
          <Paragraph>
            <strong>{t('keyFeatures')}</strong>
            <ul>
              <li>{t('feature1')}</li>
              <li>{t('feature2')}</li>
              <li>{t('feature3')}</li>
              <li>{t('feature4')}</li>
              <li>{t('feature5')}</li>
              <li>{t('feature6')}</li>
              <li>{t('feature7')}</li>
            </ul>
          </Paragraph>
        </article>

        <article className={styles.section}>
          <Title level={3}>{t('courseHeader')}</Title>
          <Paragraph>{t('courseDescription')}</Paragraph>
          <Paragraph>
            <AntLink href="https://rs.school/courses/reactjs" target="_blank">
              {t('courseLink')}
            </AntLink>
          </Paragraph>
          <Paragraph>
            <strong>{t('courseHighlights')}</strong>
            <ul>
              <li>{t('highlight1')}</li>
              <li>{t('highlight2')}</li>
              <li>{t('highlight3')}</li>
              <li>{t('highlight4')}</li>
              <li>{t('highlight5')}</li>
            </ul>
          </Paragraph>
        </article>
      </section>
    </div>
  );
}
