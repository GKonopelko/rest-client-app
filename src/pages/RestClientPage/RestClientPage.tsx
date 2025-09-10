'use client';

import { Card, Typography, Space, Input, Button, Select, Form } from 'antd';
import styles from './RestClientPage.module.css';

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
  return (
    <section className={styles.section}>
      <Card className={styles.card}>
        <Title level={2} className={styles.title}>
          Test Your Request
        </Title>
        <Form className={styles.form}>
          <Title level={3}>Request</Title>
          <Space.Compact className={styles['url-line']} size="large">
            <Form.Item>
              <Select className={styles.select} defaultValue="GET">
                {methods.map((elem) => (
                  <Option key={elem} value={elem}>
                    {elem}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item className={styles['url-wrapper']}>
              <Input placeholder="Enter base URL" />
            </Form.Item>
            <Form.Item>
              <Button type="primary">Submit</Button>
            </Form.Item>
          </Space.Compact>
        </Form>
      </Card>
    </section>
  );
}
