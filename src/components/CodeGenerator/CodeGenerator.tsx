'use client';

import React, { useState } from 'react';
import { Modal, Button, Select, Input, Typography } from 'antd';
import { CodeOutlined } from '@ant-design/icons';
import { generateCode } from '@/utils/codeGenerator';
import styles from './CodeGenerator.module.css';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

interface CodeGeneratorProps {
  method: string;
  url: string;
  headers: string;
  body: string;
}

const codeLanguages = [
  { value: 'curl', label: 'cURL' },
  { value: 'javascript-fetch', label: 'JavaScript (Fetch)' },
  { value: 'javascript-xhr', label: 'JavaScript (XHR)' },
  { value: 'nodejs', label: 'Node.js' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
];

export default function CodeGenerator({
  method,
  url,
  headers,
  body,
}: CodeGeneratorProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('curl');

  const handleGenerateCode = () => {
    try {
      let parsedHeaders = {};
      try {
        parsedHeaders = JSON.parse(headers || '{}');
      } catch {
        console.error('Invalid JSON in headers');
        return;
      }

      const code = generateCode(
        selectedLanguage,
        method,
        url,
        parsedHeaders,
        body
      );
      setGeneratedCode(code);
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error generating code:', error);
    }
  };

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    handleGenerateCode();
  };

  return (
    <>
      <Button
        icon={<CodeOutlined />}
        onClick={handleGenerateCode}
        className={styles.button}
      >
        Generate Code
      </Button>

      <Modal
        title="Generated Code"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
        className={styles.modal}
      >
        <div className={styles.modalContent}>
          <Select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className={styles.select}
          >
            {codeLanguages.map((lang) => (
              <Option key={lang.value} value={lang.value}>
                {lang.label}
              </Option>
            ))}
          </Select>

          <Title level={5} className={styles.codeTitle}>
            Code for {method} request:
          </Title>

          <TextArea
            value={generatedCode}
            readOnly
            rows={15}
            className={styles.textArea}
          />
        </div>
      </Modal>
    </>
  );
}
