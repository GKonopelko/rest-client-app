'use client';

import { Card, Typography, Space, Input, Button, Select } from 'antd';
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
        <Space.Compact className={styles['url-line']} size="large">
          <Select className={styles.select} defaultValue="GET">
            {methods.map((elem) => (
              <Option key={elem} value={elem}>
                {elem}
              </Option>
            ))}
          </Select>
          <Input placeholder="Enter base URL" />
          <Button type="primary">Submit</Button>
        </Space.Compact>
      </Card>
    </section>
  );
}
