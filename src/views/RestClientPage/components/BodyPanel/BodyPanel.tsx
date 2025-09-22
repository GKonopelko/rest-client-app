import React from 'react';
import { Typography } from 'antd';
import { useTranslations } from 'next-intl';
import JsonEditor from '@/components/JsonEditor/JsonEditor';
import styles from './BodyPanel.module.css';

const { Title } = Typography;

interface BodyPanelProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export default function BodyPanel({
  value,
  onChange,
  readOnly,
}: BodyPanelProps) {
  const t = useTranslations('RestClientPage');

  return (
    <div className={styles['body-panel']}>
      <Title level={4}>{t('body')}</Title>
      <JsonEditor
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        height="200px"
      />
    </div>
  );
}
