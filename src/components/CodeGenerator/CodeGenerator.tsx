'use client';

import React, { useState, useMemo } from 'react';
import { Button } from 'antd';
import { CodeOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import {
  interpolateVariables,
  loadVariablesFromStorage,
  extractVariableNames,
  Variable,
} from '@/utils/variablesUtils';
import styles from './CodeGenerator.module.css';
import CodeGeneratorModal from './CodeGeneratorModal';

interface CodeGeneratorProps {
  method: string;
  url: string;
  headers: string;
  body: string;
  variables?: Variable[];
}

// Выносим константы наружу - они никогда не меняются
const ERROR_MESSAGES = {
  invalidJsonHeaders: 'Invalid JSON in headers',
  interpolationError: 'Error interpolating variables',
  unresolvedVariablesError: 'Unresolved variables: {vars}',
  invalidHeadersFormat: 'Invalid headers format',
  generationError: 'Error generating {lang} code: {error}',
  unknownError: 'Unknown error',
  generalGenerationError: 'Error generating code: {error}',
};

export default function CodeGenerator({
  method,
  url,
  headers,
  body,
  variables: externalVariables = [],
}: CodeGeneratorProps) {
  const t = useTranslations('CodeGenerator');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const variables = useMemo(
    () =>
      externalVariables.length > 0
        ? externalVariables
        : loadVariablesFromStorage(),
    [externalVariables]
  );

  // Вычисляем интерполированные значения один раз при открытии модалки
  const interpolatedValues = useMemo(() => {
    try {
      let parsedHeaders = {};
      try {
        parsedHeaders = JSON.parse(headers || '{}');
      } catch {
        return {
          interpolatedUrl: url,
          interpolatedHeaders: headers,
          interpolatedBody: body,
          hasUnresolvedVars: true,
          unresolvedVars: [ERROR_MESSAGES.invalidJsonHeaders],
        };
      }

      const interpolatedUrlValue = interpolateVariables(url, variables);
      const interpolatedHeadersValue = interpolateVariables(
        JSON.stringify(parsedHeaders),
        variables
      );
      const interpolatedBodyValue = interpolateVariables(body, variables);

      const unresolvedVarsList = [
        ...extractVariableNames(interpolatedUrlValue),
        ...extractVariableNames(interpolatedHeadersValue),
        ...extractVariableNames(interpolatedBodyValue),
      ];

      return {
        interpolatedUrl: interpolatedUrlValue,
        interpolatedHeaders: interpolatedHeadersValue,
        interpolatedBody: interpolatedBodyValue,
        hasUnresolvedVars: unresolvedVarsList.length > 0,
        unresolvedVars: unresolvedVarsList,
      };
    } catch (error) {
      console.error('Error interpolating variables:', error);
      return {
        interpolatedUrl: url,
        interpolatedHeaders: headers,
        interpolatedBody: body,
        hasUnresolvedVars: true,
        unresolvedVars: [ERROR_MESSAGES.interpolationError],
      };
    }
  }, [url, headers, body, variables]);

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Button
        icon={<CodeOutlined />}
        onClick={handleOpenModal}
        className={styles.button}
      >
        {t('generateCodeButton')}
      </Button>

      {isModalVisible && (
        <CodeGeneratorModal
          isVisible={isModalVisible}
          onClose={handleCloseModal}
          method={method}
          interpolatedValues={interpolatedValues}
          errorMessages={ERROR_MESSAGES}
          translations={{
            modalTitle: t('modalTitle'),
            closeButton: t('closeButton'),
            generatingCode: t('generatingCode'),
            codeNotAvailable: t('codeNotAvailable'),
            generatingAllLanguages: t('generatingAllLanguages'),
            codeForRequestTemplate: 'Code for {method} request ({language}):',
          }}
        />
      )}
    </>
  );
}
