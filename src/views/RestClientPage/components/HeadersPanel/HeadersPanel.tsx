import React from 'react';
import { Typography } from 'antd';
import HeadersEditor from '@/components/HeadersEditor/HeadersEditor';
import { Header } from '../../types';
import styles from './HeadersPanel.module.css';

const { Title } = Typography;

interface HeadersPanelProps {
  headers: Header[];
  onChange: (headers: Header[]) => void;
}

export default function HeadersPanel({ headers, onChange }: HeadersPanelProps) {
  return (
    <div className={styles['headers-panel']}>
      <Title level={4}>Headers</Title>
      <HeadersEditor headers={headers} onChange={onChange} />
    </div>
  );
}
