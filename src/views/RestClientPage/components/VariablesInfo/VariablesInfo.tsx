import React from 'react';
import { Typography } from 'antd';
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
  const availableVariables =
    variables.map((v) => `{{${v.name}}}`).join(', ') || 'None';
  const hasVars =
    hasVariables(url) ||
    hasVariables(JSON.stringify(headers)) ||
    hasVariables(body);

  return (
    <div className={styles['variables-info']}>
      <Title level={4}>Variables Information</Title>
      <Text type="secondary">
        Use variables with format: <code>{'{{variableName}}'}</code>
      </Text>
      <br />
      <Text type="secondary">Available variables: {availableVariables}</Text>
      {hasVars && (
        <div className={styles['warning-text']}>
          <Text type="warning">
            Contains variables that will be interpolated
          </Text>
        </div>
      )}
    </div>
  );
}
