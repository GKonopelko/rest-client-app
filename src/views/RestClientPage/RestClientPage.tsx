'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Typography, message } from 'antd';
import styles from './RestClient.module.css';
import { useTranslations } from 'next-intl';

import RequestPanel from './components/RequestPanel/RequestPanel';
import HeadersPanel from './components/HeadersPanel/HeadersPanel';
import ResponsePanel from './components/ResponsePanel/ResponsePanel';
import VariablesInfo from './components/VariablesInfo/VariablesInfo';

import { useRequestHandler } from './hooks/useRequestHandler';
import { useUrlSync } from './hooks/useUrlSync';
import { RequestData, Header } from './types';
import {
  headersArrayToObject,
  headersObjectToArray,
} from '@/utils/headersUtils';
import {
  interpolateVariables,
  extractVariableNames,
} from '@/utils/variablesUtils';
import { useVariables } from './hooks/useVariables';
import BodyPanel from './components/BodyPanel/BodyPanel';

const { Title } = Typography;

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
  const [request, setRequest] = useState<RequestData>({
    method: initialMethod,
    url: initialUrl,
    headers: initialHeaders,
    body: initialBody,
  });

  const [headers, setHeaders] = useState<Header[]>(
    headersObjectToArray(initialHeaders)
  );

  const { response, isLoading, error, execute } = useRequestHandler();
  const { updateUrl } = useUrlSync();
  const { variables } = useVariables();
  const t = useTranslations('RestClientPage');

  useEffect(() => {
    setRequest((prev) => ({
      ...prev,
      headers: headersArrayToObject(headers),
    }));
  }, [headers]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateUrl(request);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [request, updateUrl]);

  const handleExecute = useCallback(async () => {
    if (!request.url.trim()) {
      message.error(t('inputError'));
      return;
    }

    let requestUrl = request.url.trim();
    if (
      !requestUrl.startsWith('http://') &&
      !requestUrl.startsWith('https://')
    ) {
      requestUrl = 'https://' + requestUrl;
    }

    try {
      const interpolatedUrl = interpolateVariables(requestUrl, variables);
      const interpolatedHeaders = interpolateVariables(
        JSON.stringify(request.headers),
        variables
      );
      const interpolatedBody = interpolateVariables(request.body, variables);

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

      await execute({
        method: request.method,
        url: interpolatedUrl,
        headers: parsedHeaders,
        body: interpolatedBody,
      });

      message.success('Request completed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      message.error('Request failed: ' + errorMessage);
    }
  }, [request, variables, execute, t]);

  const updateRequest = useCallback((updates: Partial<RequestData>) => {
    setRequest((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleHeadersChange = useCallback((newHeaders: Header[]) => {
    setHeaders(newHeaders);
  }, []);

  const handleBodyChange = useCallback(
    (body: string) => {
      updateRequest({ body });
    },
    [updateRequest]
  );

  return (
    <section className={styles.section}>
      <Card className={styles.card}>
        <Title level={2} className={styles.title}>
          {t('title')}
        </Title>

        <RequestPanel
          request={request}
          onUpdate={updateRequest}
          onExecute={handleExecute}
          isLoading={isLoading}
        />

        <div className={styles.panels}>
          <div className={styles['panel-row']}>
            <HeadersPanel headers={headers} onChange={handleHeadersChange} />
            <BodyPanel value={request.body} onChange={handleBodyChange} />
          </div>

          <ResponsePanel
            response={response}
            error={error}
            isLoading={isLoading}
          />
        </div>

        <VariablesInfo
          url={request.url}
          headers={request.headers}
          body={request.body}
          variables={variables}
        />
      </Card>
    </section>
  );
}
