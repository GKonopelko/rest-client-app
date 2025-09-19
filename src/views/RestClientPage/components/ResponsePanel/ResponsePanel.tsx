import React from 'react';
import { Typography } from 'antd';
import JsonEditor from '@/components/JsonEditor/JsonEditor';
import { ResponseData } from '../../types';
import styles from './ResponsePanel.module.css';

const { Title, Text } = Typography;

interface ResponsePanelProps {
  response?: ResponseData;
  error?: string;
  isLoading: boolean;
}

export default function ResponsePanel({ response, error }: ResponsePanelProps) {
  const responseText = error ? `Error: ${error}` : response?.body || '';

  return (
    <div className={styles['response-panel']}>
      <Title level={4}>Response</Title>

      {response && (
        <div className={styles['response-info']}>
          <Text strong>Status: </Text>
          <Text code>
            {response.status} {response.statusText}
          </Text>
          <Text strong>Time: </Text>
          <Text code>{response.time}ms</Text>
          <Text strong>Size: </Text>
          <Text code>{response.body.length} bytes</Text>
        </div>
      )}

      <JsonEditor
        value={responseText}
        onChange={() => {}}
        readOnly={true}
        height="300px"
      />
    </div>
  );
}
