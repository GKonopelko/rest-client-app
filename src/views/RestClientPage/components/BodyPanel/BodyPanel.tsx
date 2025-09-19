import React from 'react';
import { Typography } from 'antd';
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
  return (
    <div className={styles['body-panel']}>
      <Title level={4}>Body</Title>
      <JsonEditor
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        height="200px"
      />
    </div>
  );
}
