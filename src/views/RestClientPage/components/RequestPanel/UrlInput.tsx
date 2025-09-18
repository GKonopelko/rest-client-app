import React from 'react';
import { Input } from 'antd';
import styles from './RequestPanel.module.css';

interface UrlInputProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

export default function UrlInput({
  value,
  onChange,
  placeholder,
}: UrlInputProps) {
  return (
    <Input
      className={styles['url-input']}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
