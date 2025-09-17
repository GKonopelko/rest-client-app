'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Card, Typography, Space, Input, Button, Select, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import styles from './RestClient.module.css';
import { useTranslations } from 'next-intl';
import {
  Variable,
  interpolateVariables,
  loadVariablesFromStorage,
  hasVariables,
  extractVariableNames,
} from '@/utils/variablesUtils';
import CodeGenerator from '@/components/CodeGenerator/CodeGenerator';
import {
  encodeRequestToUrl,
  decodeRequestFromUrl,
  headersObjectToString,
  headersStringToObject,
} from '@/utils/urlEncoding';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const methods: string[] = [
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

export default function RestClientPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlParts = pathname?.split('/') ?? [];
  const [method, setMethod] = useState(urlParts[3] ?? 'GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState(
    '{\n  "Content-Type": "application/json"\n}'
  );
  const [body, setBody] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [variables, setVariables] = useState<Variable[]>([]);
  const t = useTranslations('RestClientPage');

  useEffect(() => {
    const savedVariables = loadVariablesFromStorage();
    setVariables(savedVariables);

    const decodedRequest = decodeRequestFromUrl(searchParams);
    if (decodedRequest) {
      setMethod(decodedRequest.method);
      setUrl(decodedRequest.url);
      setHeaders(headersObjectToString(decodedRequest.headers));
      setBody(decodedRequest.body);
    }
  }, [pathname, searchParams]);

  const updateUrlWithCurrentState = useCallback(() => {
    try {
      if (!url.trim()) return;

      const headersObj = headersStringToObject(headers);
      const encodedUrl = encodeRequestToUrl(method, url, headersObj, body);

      router.push(encodedUrl, { scroll: false });
    } catch (error) {
      console.error('Error updating URL:', error);
    }
  }, [method, url, headers, body, router]);

  useEffect(() => {
    const timeoutId = setTimeout(updateUrlWithCurrentState, 500);
    return () => clearTimeout(timeoutId);
  }, [updateUrlWithCurrentState]);

  const handleSendRequest = async () => {
    if (!url.trim()) {
      message.error(t('inputError'));
      return;
    }

    try {
      setLoading(true);

      const interpolatedUrl = interpolateVariables(url, variables);
      const interpolatedHeaders = interpolateVariables(headers, variables);
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

      let parsedHeaders = {};
      try {
        parsedHeaders = JSON.parse(interpolatedHeaders || '{}');
      } catch {
        message.error('Invalid JSON in headers');
        return;
      }

      const startTime = Date.now();
      const response = await fetch(interpolatedUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...parsedHeaders,
        },
        body:
          method !== 'GET' && method !== 'HEAD' ? interpolatedBody : undefined,
      });

      const responseTime = Date.now() - startTime;
      const responseData = await response.text();

      const formattedResponse = `Status: ${response.status} ${response.statusText}
Time: ${responseTime}ms
Size: ${responseData.length} bytes

${responseData}`;

      setResponse(formattedResponse);
      message.success('Request completed successfully');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      message.error('Request failed: ' + errorMessage);
      setResponse(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const availableVariables =
    variables.map((v) => `{{${v.name}}}`).join(', ') || 'None';

  return (
    <section className={styles.section}>
      <Card className={styles.card}>
        <Title level={2} className={styles.title}>
          {t('title')}
        </Title>

        <div className={styles.form}>
          <Title level={3}>{t('request')}</Title>
          <Space.Compact className={styles['url-line']} size="large">
            <Select
              className={styles.select}
              value={method}
              onChange={(value) => setMethod(value)}
            >
              {methods.map((elem) => (
                <Option key={elem} value={elem}>
                  {elem}
                </Option>
              ))}
            </Select>
            <Input
              className={styles['url-input']}
              placeholder={t('urlPlaceholder')}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendRequest}
              loading={loading}
              className={styles['submit-button']}
            >
              {t('submitButton')}
            </Button>
            <CodeGenerator
              method={method}
              url={url}
              headers={headers}
              body={body}
            />
          </Space.Compact>
        </div>

        <div className={styles.panels}>
          <div className={styles['panel-row']}>
            <div className={styles.panel}>
              <Title level={4}>Headers (JSON)</Title>
              <TextArea
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                rows={6}
                placeholder='{"Content-Type": "application/json"}'
                className={styles['text-area']}
              />
            </div>

            <div className={styles.panel}>
              <Title level={4}>Body</Title>
              <TextArea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                placeholder='{"key": "value"}'
                className={styles['text-area']}
              />
            </div>
          </div>

          <div className={styles['panel-full']}>
            <Title level={4}>Response</Title>
            <TextArea
              value={response}
              readOnly
              rows={12}
              className={styles['text-area-readonly']}
            />
          </div>
        </div>

        <div className={styles['variables-info']}>
          <Title level={4}>Variables Information</Title>
          <Text type="secondary">
            Use variables with format: <code>{'{{variableName}}'}</code>
          </Text>
          <br />
          <Text type="secondary">
            Available variables: {availableVariables}
          </Text>
          {hasVariables(url) || hasVariables(headers) || hasVariables(body) ? (
            <div className={styles['warning-text']}>
              <Text type="warning">
                Contains variables that will be interpolated
              </Text>
            </div>
          ) : null}
        </div>
      </Card>
    </section>
  );
}
