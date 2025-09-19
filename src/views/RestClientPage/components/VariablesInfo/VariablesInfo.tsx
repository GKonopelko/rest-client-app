import React from 'react';
import { Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { Variable, hasVariables } from '@/utils/variablesUtils';
import styles from './VariablesInfo.module.css';

const { Title, Text } = Typography;

interface VariablesInfoProps {
  url: string;
  headers: Record<string, string>;
  body: string;
  variables: Variable[];
}

export default function VariablesInfo({
  url,
  headers,
  body,
  variables,
}: VariablesInfoProps) {
  const t = useTranslations('RestClientPage');
  const availableVariables =
    variables.map((v) => `{{${v.name}}}`).join(', ') || 'None';
  const hasVars =
    hasVariables(url) ||
    hasVariables(JSON.stringify(headers)) ||
    hasVariables(body);

  return (
    <div className={styles['variables-info']}>
      <Title level={4}>{t('variablesInfo')}</Title>
      <Text type="secondary">
        {t('variablesFormat')} <code>{'{{variableName}}'}</code>
      </Text>
      <br />
      <Text type="secondary">
        {t('availableVariables')} {availableVariables}
      </Text>
      {hasVars && (
        <div className={styles['warning-text']}>
          <Text type="warning">{t('containsVariables')}</Text>
        </div>
      )}
    </div>
  );
}
