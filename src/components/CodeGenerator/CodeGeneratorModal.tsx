'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Button, Select, Input, Typography, Spin } from 'antd';
import { generateCode } from '@/utils/codeGenerator';
import styles from './CodeGenerator.module.css';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

interface CodeGeneratorModalProps {
  isVisible: boolean;
  onClose: () => void;
  method: string;
  interpolatedValues: {
    interpolatedUrl: string;
    interpolatedHeaders: string;
    interpolatedBody: string;
    hasUnresolvedVars: boolean;
    unresolvedVars: string[];
  };
  errorMessages: {
    unresolvedVariablesError: string;
    invalidHeadersFormat: string;
    generationError: string;
    unknownError: string;
    generalGenerationError: string;
  };
  translations: {
    modalTitle: string;
    closeButton: string;
    generatingCode: string;
    codeNotAvailable: string;
    generatingAllLanguages: string;
    codeForRequestTemplate: string;
  };
}

interface GeneratedCodes {
  [key: string]: string;
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

export default function CodeGeneratorModal({
  isVisible,
  onClose,
  method,
  interpolatedValues,
  errorMessages,
  translations,
}: CodeGeneratorModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('curl');
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedCodes>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string>('');
  const isGeneratingRef = useRef(false);
  const interpolatedValuesRef = useRef(interpolatedValues);
  const methodRef = useRef(method);
  const errorMessagesRef = useRef(errorMessages);

  useEffect(() => {
    interpolatedValuesRef.current = interpolatedValues;
    methodRef.current = method;
    errorMessagesRef.current = errorMessages;
  }, [interpolatedValues, method, errorMessages]);

  const generateAllCodes = useCallback(async () => {
    if (isGeneratingRef.current) return;

    isGeneratingRef.current = true;
    setIsGenerating(true);
    setGenerationError('');

    const {
      interpolatedUrl,
      interpolatedHeaders,
      interpolatedBody,
      hasUnresolvedVars,
      unresolvedVars,
    } = interpolatedValuesRef.current;

    try {
      if (hasUnresolvedVars) {
        const errorMessage =
          errorMessagesRef.current.unresolvedVariablesError.replace(
            '{vars}',
            unresolvedVars.join(', ')
          );
        const errorCodes: GeneratedCodes = {};
        codeLanguages.forEach((lang) => {
          errorCodes[lang.value] = errorMessage;
        });
        setGeneratedCodes(errorCodes);
        setGenerationError(errorMessage);
        return;
      }

      let finalHeaders = {};
      try {
        finalHeaders = JSON.parse(interpolatedHeaders || '{}');
      } catch {
        const errorMessage = errorMessagesRef.current.invalidHeadersFormat;
        const errorCodes: GeneratedCodes = {};
        codeLanguages.forEach((lang) => {
          errorCodes[lang.value] = errorMessage;
        });
        setGeneratedCodes(errorCodes);
        setGenerationError(errorMessage);
        return;
      }

      const codes: GeneratedCodes = {};

      for (const lang of codeLanguages) {
        try {
          const code = generateCode(
            lang.value,
            methodRef.current,
            interpolatedUrl,
            finalHeaders,
            interpolatedBody
          );
          codes[lang.value] = code;
        } catch (error) {
          codes[lang.value] = errorMessagesRef.current.generationError
            .replace('{lang}', lang.label)
            .replace(
              '{error}',
              error instanceof Error
                ? error.message
                : errorMessagesRef.current.unknownError
            );
        }
      }

      setGeneratedCodes(codes);
    } catch (error) {
      const errorMessage =
        errorMessagesRef.current.generalGenerationError.replace(
          '{error}',
          error instanceof Error
            ? error.message
            : errorMessagesRef.current.unknownError
        );
      const errorCodes: GeneratedCodes = {};
      codeLanguages.forEach((lang) => {
        errorCodes[lang.value] = errorMessage;
      });
      setGeneratedCodes(errorCodes);
      setGenerationError(errorMessage);
    } finally {
      setIsGenerating(false);
      isGeneratingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    generateAllCodes();
  }, [isVisible, generateAllCodes]); // generateAllCodes is now stable

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
  };

  const currentCode = isGenerating
    ? translations.generatingCode
    : generationError
      ? generationError
      : generatedCodes[selectedLanguage] || translations.codeNotAvailable;

  const languageLabel =
    codeLanguages.find((lang) => lang.value === selectedLanguage)?.label || '';

  return (
    <Modal
      title={translations.modalTitle}
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          {translations.closeButton}
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
          loading={isGenerating}
          disabled={isGenerating || !!generationError}
        >
          {codeLanguages.map((lang) => (
            <Option key={lang.value} value={lang.value}>
              {lang.label}
            </Option>
          ))}
        </Select>

        {isGenerating && (
          <div className={styles['loading-indicator']}>
            <Spin size="large" />
            <span style={{ marginLeft: 8 }}>
              {translations.generatingAllLanguages}
            </span>
          </div>
        )}

        {!isGenerating && (
          <>
            <Title level={5} className={styles['code-title']}>
              {translations.codeForRequestTemplate
                .replace('{method}', method)
                .replace('{language}', languageLabel)}
            </Title>

            <TextArea
              value={currentCode}
              readOnly
              rows={15}
              className={styles['text-area']}
            />
          </>
        )}
      </div>
    </Modal>
  );
}
