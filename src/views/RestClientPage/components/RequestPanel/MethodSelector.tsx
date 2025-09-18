import React from 'react';
import { Select } from 'antd';
import styles from './RequestPanel.module.css';

const { Option } = Select;

const methods = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'HEAD',
  'OPTIONS',
  'CONNECT',
  'TRACE',
];

interface MethodSelectorProps {
  value: string;
  onChange: (method: string) => void;
}

export default function MethodSelector({
  value,
  onChange,
}: MethodSelectorProps) {
  return (
    <Select className={styles.select} value={value} onChange={onChange}>
      {methods.map((method) => (
        <Option key={method} value={method}>
          {method}
        </Option>
      ))}
    </Select>
  );
}
