'use client';

import React, { useState } from 'react';
import { Button, Space, Select, message } from 'antd';
import { FormatPainterOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';
import styles from './JsonEditor.module.css';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className={styles['editor-loading']}>Loading editor...</div>
  ),
});

const { Option } = Select;

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  height?: string;
}

export default function JsonEditor({
  value,
  onChange,
  readOnly = false,
  placeholder = '{}',
  height = '200px',
}: JsonEditorProps) {
  const [language, setLanguage] = useState('json');
  const [localValue, setLocalValue] = useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const formatJson = () => {
    try {
      if (language === 'json') {
        const contentToFormat = localValue.trim() || placeholder;
        const parsed = JSON.parse(contentToFormat);
        const formatted = JSON.stringify(parsed, null, 2);
        setLocalValue(formatted);
        onChange(formatted);
        message.success('JSON formatted successfully');
      }
    } catch {
      message.error('Invalid JSON format');
    }
  };

  const handleEditorChange = (newValue: string | undefined) => {
    const updatedValue = newValue || '';
    setLocalValue(updatedValue);
    onChange(updatedValue);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  const showFormatButton = !readOnly && language === 'json';

  return (
    <div className={styles['json-editor']}>
      <Space className={styles.toolbar}>
        <Select
          value={language}
          onChange={handleLanguageChange}
          className={styles['language-select']}
          disabled={readOnly}
        >
          <Option value="json">JSON</Option>
          <Option value="plaintext">Text</Option>
        </Select>

        {showFormatButton && (
          <Button
            icon={<FormatPainterOutlined />}
            onClick={formatJson}
            size="small"
            className={styles['format-button']}
          >
            Format
          </Button>
        )}
      </Space>

      <Editor
        height={height}
        language={language}
        value={localValue || (readOnly ? '' : placeholder)}
        onChange={handleEditorChange}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          suggestOnTriggerCharacters: true,
          parameterHints: { enabled: true },
          quickSuggestions: true,
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            useShadows: false,
          },
        }}
        theme="vs-light"
      />
    </div>
  );
}
