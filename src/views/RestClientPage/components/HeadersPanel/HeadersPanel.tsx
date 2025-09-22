import React from 'react';
import { Typography } from 'antd';
import { useTranslations } from 'next-intl';
import HeadersEditor from '@/components/HeadersEditor/HeadersEditor';
import { Header } from '../../types';
import styles from './HeadersPanel.module.css';

const { Title } = Typography;

interface HeadersPanelProps {
  headers: Header[];
  onChange: (headers: Header[]) => void;
}

export default function HeadersPanel({ headers, onChange }: HeadersPanelProps) {
  const t = useTranslations('RestClientPage');

  return (
    <div className={styles['headers-panel']}>
      <Title level={4}>{t('headers')}</Title>
      <HeadersEditor headers={headers} onChange={onChange} />
    </div>
  );
}
