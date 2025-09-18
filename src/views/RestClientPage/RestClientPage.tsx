'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import JsonEditor from '@/components/JsonEditor/JsonEditor';
import HeadersEditor from '@/components/HeadersEditor/HeadersEditor';
import {
  Header as HeaderType,
  headersArrayToObject,
} from '@/utils/headersUtils';
import { useRouter, useParams } from 'next/navigation';
import { encodeRequestToUrl } from '@/utils/urlEncoding';

const { Title, Text } = Typography;
const { Option } = Select;

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

interface RestClientPageProps {
  initialMethod?: string;
  initialUrl?: string;
  initialBody?: string;
  initialHeaders?: Record<string, string>;
}

export default function RestClientPage({
  initialMethod = 'GET',
  initialUrl = '',
  initialBody = '',
  initialHeaders = {},
}: RestClientPageProps) {
  const [method, setMethod] = useState(initialMethod);
  const [url, setUrl] = useState(initialUrl);
  const [headers, setHeaders] = useState<HeaderType[]>([]);
  const [body, setBody] = useState(initialBody);
  const [response, setResponse] = useState('');
  const [responseStatus, setResponseStatus] = useState('');
  const [responseTime, setResponseTime] = useState('');
  const [responseSize, setResponseSize] = useState('');
  const [loading, setLoading] = useState(false);
  const [variables, setVariables] = useState<Variable[]>([]);
  const t = useTranslations('RestClientPage');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const isRequestInProgress = useRef(false);
  const isInitialMount = useRef(true);

  const updateUrl = useCallback(() => {
    const headersObj = headersArrayToObject(headers);
    const newUrl = encodeRequestToUrl(method, url, headersObj, body, locale);

    router.replace(newUrl, { scroll: false });
  }, [method, url, headers, body, locale, router]);

  useEffect(() => {
    const savedVariables = loadVariablesFromStorage();
    setVariables(savedVariables);

    if (Object.keys(initialHeaders).length > 0) {
      setHeaders(
        Object.entries(initialHeaders).map(([key, value]) => ({
          key,
          value,
        }))
      );
    }

    isInitialMount.current = false;
  }, [initialMethod, initialUrl, initialBody, initialHeaders]);

  useEffect(() => {
    if (isInitialMount.current || isRequestInProgress.current) return;

    const timeoutId = setTimeout(updateUrl, 300);

    return () => clearTimeout(timeoutId);
  }, [method, url, headers, body, updateUrl]);

  const handleSendRequest = async () => {
    if (!url.trim()) {
      message.error(t('inputError'));
      return;
    }

    isRequestInProgress.current = true;

    let requestUrl = url.trim();
    if (
      !requestUrl.startsWith('http://') &&
      !requestUrl.startsWith('https://')
    ) {
      requestUrl = 'https://' + requestUrl;
    }

    try {
      setLoading(true);
      setResponse('');
      setResponseStatus('');
      setResponseTime('');
      setResponseSize('');

      const headersObj = headersArrayToObject(headers);
      const interpolatedUrl = interpolateVariables(requestUrl, variables);
      const interpolatedHeaders = interpolateVariables(
        JSON.stringify(headersObj),
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

      const responseTimeMs = Date.now() - startTime;
      const responseData = await response.text();

      setResponseStatus(`${response.status} ${response.statusText}`);
      setResponseTime(`${responseTimeMs}ms`);
      setResponseSize(`${responseData.length} bytes`);
      setResponse(responseData);

      message.success('Request completed successfully');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      message.error('Request failed: ' + errorMessage);
      setResponse(`Error: ${errorMessage}`);
      setResponseStatus('Error');
    } finally {
      setLoading(false);
      isRequestInProgress.current = false;

      updateUrl();
    }
  };

  const handleMethodChange = (value: string) => {
    setMethod(value);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleHeadersChange = (newHeaders: HeaderType[]) => {
    setHeaders(newHeaders);
  };

  const handleBodyChange = (value: string) => {
    setBody(value);
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
              onChange={handleMethodChange}
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
              onChange={handleUrlChange}
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
              headers={JSON.stringify(headersArrayToObject(headers))}
              body={body}
              variables={variables}
            />
          </Space.Compact>
        </div>

        <div className={styles.panels}>
          <div className={styles['panel-row']}>
            <div className={styles.panel}>
              <Title level={4}>Headers</Title>
              <HeadersEditor headers={headers} onChange={handleHeadersChange} />
            </div>

            <div className={styles.panel}>
              <Title level={4}>Body</Title>
              <JsonEditor
                value={body}
                onChange={handleBodyChange}
                height="200px"
              />
            </div>
          </div>

          <div className={styles['panel-full']}>
            <Title level={4}>Response</Title>

            {responseStatus && (
              <div className={styles['response-info']}>
                <Text strong>Status: </Text>
                <Text code>{responseStatus}</Text>
                <Text strong>Time: </Text>
                <Text code>{responseTime}</Text>
                <Text strong>Size: </Text>
                <Text code>{responseSize}</Text>
              </div>
            )}

            <JsonEditor
              value={response}
              onChange={() => {}}
              readOnly={true}
              height="300px"
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
          {hasVariables(url) ||
          hasVariables(JSON.stringify(headersArrayToObject(headers))) ||
          hasVariables(body) ? (
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
