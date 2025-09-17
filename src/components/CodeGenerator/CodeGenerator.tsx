'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Select, Input, Typography, message } from 'antd';
import { CodeOutlined } from '@ant-design/icons';
import { generateCode } from '@/utils/codeGenerator';
import {
  interpolateVariables,
  loadVariablesFromStorage,
  extractVariableNames,
  Variable,
} from '@/utils/variablesUtils';
import styles from './CodeGenerator.module.css';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

interface CodeGeneratorProps {
  method: string;
  url: string;
  headers: string;
  body: string;
  variables?: Variable[];
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
  variables: externalVariables = [],
}: CodeGeneratorProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('curl');
  const [variables, setVariables] = useState<Variable[]>(externalVariables);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (externalVariables.length === 0) {
      const savedVariables = loadVariablesFromStorage();
      setVariables(savedVariables);
    } else {
      setVariables(externalVariables);
    }
  }, [externalVariables]);

  const handleGenerateCode = useCallback(() => {
    try {
      setLoading(true);

      let parsedHeaders = {};
      try {
        parsedHeaders = JSON.parse(headers || '{}');
      } catch {
        message.error('Invalid JSON in headers');
        return;
      }

      const interpolatedUrl = interpolateVariables(url, variables);
      const interpolatedHeaders = interpolateVariables(
        JSON.stringify(parsedHeaders),
        variables
      );
      const interpolatedBody = interpolateVariables(body, variables);

      const unresolvedVars = [
        ...extractVariableNames(interpolatedUrl),
        ...extractVariableNames(interpolatedHeaders),
        ...extractVariableNames(interpolatedBody),
      ];

      if (unresolvedVars.length > 0) {
        message.error(`Unresolved variables: ${unresolvedVars.join(', ')}`);
        return;
      }

      let finalHeaders = {};
      try {
        finalHeaders = JSON.parse(interpolatedHeaders || '{}');
      } catch {
        message.error('Invalid JSON in headers after variable interpolation');
        return;
      }

      const code = generateCode(
        selectedLanguage,
        method,
        interpolatedUrl,
        finalHeaders,
        interpolatedBody
      );
      setGeneratedCode(code);
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error generating code:', error);
      message.error('Failed to generate code');
    } finally {
      setLoading(false);
    }
  }, [method, url, headers, body, variables, selectedLanguage]);

  useEffect(() => {
    if (isModalVisible) {
      handleGenerateCode();
    }
  }, [method, url, headers, body, isModalVisible, handleGenerateCode]);

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
        loading={loading}
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
        <div className={styles['modal-content']}>
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

          <Title level={5} className={styles['code-title']}>
            Code for {method} request:
          </Title>

          <TextArea
            value={generatedCode}
            readOnly
            rows={15}
            className={styles['text-area']}
          />
        </div>
      </Modal>
    </>
  );
}
