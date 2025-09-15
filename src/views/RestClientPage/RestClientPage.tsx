'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Card, Typography, Space, Input, Button, Select, Form } from 'antd';
import styles from './RestClient.module.css';
import { useTranslations } from 'next-intl';

interface RequestData {
  method: string;
}
const { Title } = Typography;
const { Option } = Select;
const methods: string[] = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'HEAD',
  'OPTIONS',
  'CONNECT',
  'TRACE',
];

export default function RestClientPage() {
  const pathname = usePathname();
  const urlParts = pathname?.split('/') ?? [];
  const [method, _] = useState(urlParts[3] ?? 'GET');
  const t = useTranslations('RestClientPage');

  const router = useRouter();

  const onFinish = (data: RequestData) => {
    if (!urlParts) return;
    if (urlParts.length >= 3) {
      router?.push(`/${urlParts[2]}/${data.method}`);
    } else {
      router?.push(`${pathname}/${data.method}`);
    }
  };

  return (
    <section className={styles.section}>
      <Card className={styles.card}>
        <Title level={2} className={styles.title}>
          {t('title')}
        </Title>
        <Form className={styles.form} onFinish={onFinish}>
          <Title level={3}>{t('request')}</Title>
          <Space.Compact className={styles['url-line']} size="large">
            <Form.Item name="method" initialValue={method}>
              <Select className={styles.select}>
                {methods.map((elem) => (
                  <Option key={elem} value={elem}>
                    {elem}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item className={styles['url-wrapper']}>
              <Input placeholder={t('url-placeholder')} />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className={styles['submit-button']}
              >
                {t('submitButton')}
              </Button>
            </Form.Item>
          </Space.Compact>
        </Form>
      </Card>
    </section>
  );
}
