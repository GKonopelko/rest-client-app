'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import JsonEditor from '@/components/JsonEditor/JsonEditor';

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

export default function RestClientPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const pathParts = pathname?.split('/') ?? [];
  const routeMethod = methods.includes(pathParts[3]) ? pathParts[3] : 'GET';

  const [method, setMethod] = useState(routeMethod);
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState(
    '{\n  "Content-Type": "application/json"\n}'
  );
  const [body, setBody] = useState('');
  const [response, setResponse] = useState('');
  const [responseStatus, setResponseStatus] = useState('');
  const [responseTime, setResponseTime] = useState('');
  const [responseSize, setResponseSize] = useState('');
  const [loading, setLoading] = useState(false);
  const [variables, setVariables] = useState<Variable[]>([]);
  const t = useTranslations('RestClientPage');

  const isInitialLoad = useRef(true);
  const isRequestInProgress = useRef(false);

  useEffect(() => {
    const savedVariables = loadVariablesFromStorage();
    setVariables(savedVariables);

    const decodedRequest = decodeRequestFromUrl(pathname, searchParams);
    if (decodedRequest) {
      setMethod(decodedRequest.method);
      setUrl(decodedRequest.url);
      setHeaders(headersObjectToString(decodedRequest.headers));
      setBody(decodedRequest.body);
    }

    isInitialLoad.current = false;
  }, [pathname, searchParams]);

  const updateUrl = useCallback(() => {
    if (isInitialLoad.current || !url.trim() || isRequestInProgress.current)
      return;

    try {
      const headersObj = headersStringToObject(headers);
      const encodedUrl = encodeRequestToUrl(method, url, headersObj, body);
      router.push(encodedUrl);
    } catch (error) {
      console.error('Error updating URL:', error);
    }
  }, [method, url, headers, body, router]);

  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scheduleUrlUpdate = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      updateUrl();
    }, 1000);
  }, [updateUrl]);

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

      const interpolatedUrl = interpolateVariables(requestUrl, variables);
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
      setTimeout(() => {
        isRequestInProgress.current = false;
      }, 100);
    }
  };

  const handleMethodChange = (value: string) => {
    setMethod(value);
    scheduleUrlUpdate();
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    scheduleUrlUpdate();
  };

  const handleHeadersChange = (value: string) => {
    setHeaders(value);
    scheduleUrlUpdate();
  };

  const handleBodyChange = (value: string) => {
    setBody(value);
    scheduleUrlUpdate();
  };

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

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
              headers={headers}
              body={body}
            />
          </Space.Compact>
        </div>

        <div className={styles.panels}>
          <div className={styles['panel-row']}>
            <div className={styles.panel}>
              <Title level={4}>Headers (JSON)</Title>
              <JsonEditor
                value={headers}
                onChange={handleHeadersChange}
                height="200px"
              />
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
