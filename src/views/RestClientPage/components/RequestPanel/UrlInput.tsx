import React, { memo, useCallback } from 'react';
import { Input } from 'antd';
import styles from './RequestPanel.module.css';

interface UrlInputProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

const UrlInput = memo(({ value, onChange, placeholder }: UrlInputProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <Input
      className={styles['url-input']}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
    />
  );
});

UrlInput.displayName = 'UrlInput';

export default UrlInput;
