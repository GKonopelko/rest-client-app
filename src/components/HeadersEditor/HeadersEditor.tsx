'use client';

import React from 'react';
import { Button, Input, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './HeadersEditor.module.css';

interface Header {
  key: string;
  value: string;
}

interface HeadersEditorProps {
  headers: Header[];
  onChange: (headers: Header[]) => void;
}

export default function HeadersEditor({
  headers,
  onChange,
}: HeadersEditorProps) {
  const addHeader = () => {
    onChange([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    const newHeaders = headers.filter((_, i) => i !== index);
    onChange(newHeaders);
  };

  const updateHeader = (
    index: number,
    field: 'key' | 'value',
    newValue: string
  ) => {
    const newHeaders = headers.map((header, i) =>
      i === index ? { ...header, [field]: newValue } : header
    );
    onChange(newHeaders);
  };

  return (
    <div className={styles['headers-editor']}>
      <div className={styles['headers-list']}>
        {headers.map((header, index) => (
          <Space key={index} className={styles['header-row']}>
            <Input
              placeholder="Header Key"
              value={header.key}
              onChange={(e) => updateHeader(index, 'key', e.target.value)}
              className={styles['header-input']}
            />
            <Input
              placeholder="Header Value"
              value={header.value}
              onChange={(e) => updateHeader(index, 'value', e.target.value)}
              className={styles['header-input']}
            />
            <Button
              icon={<DeleteOutlined />}
              onClick={() => removeHeader(index)}
              danger
              className={styles['remove-button']}
            />
          </Space>
        ))}
      </div>

      <Button
        icon={<PlusOutlined />}
        onClick={addHeader}
        type="dashed"
        className={styles['add-button']}
      >
        Add Header
      </Button>
    </div>
  );
}
