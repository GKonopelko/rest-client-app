import React, { memo, useCallback } from 'react';
import { Button, Space } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';

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

const RequestPanel = memo(
  ({ request, onUpdate, onExecute, isLoading }: RequestPanelProps) => {
    const t = useTranslations('RestClientPage');

    const handleMethodChange = useCallback(
      (method: string) => {
        onUpdate({ method });
      },
      [onUpdate]
    );

    const handleUrlChange = useCallback(
      (url: string) => {
        onUpdate({ url });
      },
      [onUpdate]
    );

    return (
      <div className={styles['request-panel']}>
        <h3>{t('request')}</h3>
        <Space.Compact className={styles['url-line']} size="large">
          <MethodSelector
            value={request.method}
            onChange={handleMethodChange}
          />
          <UrlInput
            value={request.url}
            onChange={handleUrlChange}
            placeholder={t('urlPlaceholder')}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={onExecute}
            loading={isLoading}
            className={styles['submit-button']}
          >
            {t('submitButton')}
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
);

RequestPanel.displayName = 'RequestPanel';

export default RequestPanel;
