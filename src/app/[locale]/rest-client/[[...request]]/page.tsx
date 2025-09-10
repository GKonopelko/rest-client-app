'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Card, Typography, Space, Input, Button, Select, Form } from 'antd';
import styles from './page.module.css';
import { useTranslations } from 'next-intl';

interface RequestData {
  method: string;
  url: string;
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

const encodeBase64 = (str: string) => {
  if (typeof window !== 'undefined') {
    return window.btoa(str);
  } else {
    return Buffer.from(str, 'utf-8').toString('base64');
  }
};

export default function RestClientPage() {
  const pathname = usePathname();
  const urlParts = pathname?.split('/');
  const [method, setMethod] = useState(urlParts?.[3] ?? 'GET');
  const t = useTranslations('RestClientPage');
  const router = useRouter();

  const onFinish = (data: RequestData) => {
    const urlParts = pathname?.split('/');
    if (!urlParts) return;
    const base64String = encodeURIComponent(
      encodeBase64(JSON.stringify({ url: data.url }))
    );
    if (urlParts.length >= 3) {
      router?.push(`/${urlParts[2]}/${data.method}/${base64String}`);
    } else {
      router?.push(`${pathname}/${data.method}/${base64String}`);
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
              <Select
                className={styles.select}
                value={method}
                onChange={setMethod}
              >
                {methods.map((elem) => (
                  <Option key={elem} value={elem}>
                    {elem}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="url"
              className={styles['url-wrapper']}
              rules={[{ required: true, message: t('inputError') }]}
            >
              <Input placeholder={t('urlPlaceholder')} />
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
