import React from 'react';
import { Typography, Alert } from 'antd';
import JsonEditor from '@/components/JsonEditor/JsonEditor';
import { ResponseData } from '../../types';
import styles from './ResponsePanel.module.css';

const { Title, Text } = Typography;

interface ResponsePanelProps {
  response?: ResponseData;
  error?: string;
  isLoading: boolean;
}

export default function ResponsePanel({
  response,
  error,
  isLoading,
}: ResponsePanelProps) {
  const responseText = error
    ? `Error: ${error}`
    : response
      ? response.body
      : '';

  return (
    <div className={styles['response-panel']}>
      <Title level={4}>Response</Title>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {response && (
        <div className={styles['response-info']}>
          <Text strong>Status: </Text>
          <Text
            code
            className={response.status >= 400 ? styles.error : styles.success}
          >
            {response.status} {response.statusText}
          </Text>
          <Text strong>Time: </Text>
          <Text code>{response.time}ms</Text>
          <Text strong>Size: </Text>
          <Text code>{response.body?.length || 0} bytes</Text>
        </div>
      )}

      {(response || error) && (
        <JsonEditor
          value={responseText}
          onChange={() => {}}
          readOnly={true}
          height="300px"
        />
      )}

      {!response && !error && !isLoading && (
        <Text type="secondary">
          No response yet. Send a request to see results.
        </Text>
      )}
    </div>
  );
}
