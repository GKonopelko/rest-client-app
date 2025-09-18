import React from 'react';
import { Button, Space } from 'antd';
import { SendOutlined } from '@ant-design/icons';

import CodeGenerator from '@/components/CodeGenerator/CodeGenerator';
import { RequestData } from '../../types';
import styles from './RequestPanel.module.css';
import MethodSelector from './MethodSelector';
import UrlInput from './UrlInput';

interface RequestPanelProps {
  request: RequestData;
  onUpdate: (updates: Partial<RequestData>) => void;
  onExecute: () => void;
  isLoading: boolean;
}

export default function RequestPanel({
  request,
  onUpdate,
  onExecute,
  isLoading,
}: RequestPanelProps) {
  const handleMethodChange = (method: string) => {
    onUpdate({ method });
  };

  const handleUrlChange = (url: string) => {
    onUpdate({ url });
  };

  return (
    <div className={styles['request-panel']}>
      <h3>Request</h3>
      <Space.Compact className={styles['url-line']} size="large">
        <MethodSelector value={request.method} onChange={handleMethodChange} />
        <UrlInput
          value={request.url}
          onChange={handleUrlChange}
          placeholder="Enter URL"
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={onExecute}
          loading={isLoading}
          className={styles['submit-button']}
        >
          Send
        </Button>
        <CodeGenerator
          method={request.method}
          url={request.url}
          headers={JSON.stringify(request.headers)}
          body={request.body}
        />
      </Space.Compact>
    </div>
  );
}
