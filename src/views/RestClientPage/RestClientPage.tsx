'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { Card, Typography, message, Spin } from 'antd';
import { useTranslations } from 'next-intl';
import styles from './RestClient.module.css';

import RequestPanel from './components/RequestPanel/RequestPanel';
import HeadersPanel from './components/HeadersPanel/HeadersPanel';
import ResponsePanel from './components/ResponsePanel/ResponsePanel';
import BodyPanel from './components/BodyPanel/BodyPanel';
import VariablesInfo from './components/VariablesInfo/VariablesInfo';

import { useRequestHandler } from './hooks/useRequestHandler';
import { useVariables } from './hooks/useVariables';
import { useUrlSync } from './hooks/useUrlSync';
import { RequestData, Header } from './types';
import {
  headersArrayToObject,
  headersObjectToArray,
} from '@/utils/headersUtils';

const { Title } = Typography;

interface RestClientPageProps {
  initialMethod?: string;
  initialUrl?: string;
  initialBody?: string;
  initialHeaders?: Record<string, string>;
}

const STORAGE_KEY = 'rest-client-request-data';

const RestClientPage = memo(
  ({
    initialMethod = 'GET',
    initialUrl = '',
    initialBody = '',
    initialHeaders = {},
  }: RestClientPageProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const [request, setRequest] = useState<RequestData>({
      method: 'GET',
      url: '',
      headers: {},
      body: '',
    });
    const [headers, setHeaders] = useState<Header[]>([]);

    const { response, isLoading, error, execute } = useRequestHandler();
    const { variables } = useVariables();
    const { updateUrl } = useUrlSync();
    const t = useTranslations('RestClientPage');

    useEffect(() => {
      setIsMounted(true);

      const loadSavedRequest = (): RequestData => {
        try {
          if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
              return JSON.parse(saved);
            }
          }
        } catch (error) {
          console.error('Error loading saved request:', error);
        }

        return {
          method: initialMethod,
          url: initialUrl,
          headers: initialHeaders,
          body: initialBody,
        };
      };

      const savedRequest = loadSavedRequest();
      setRequest(savedRequest);
      setHeaders(headersObjectToArray(savedRequest.headers));
    }, [initialMethod, initialUrl, initialBody, initialHeaders]);

    useEffect(() => {
      if (isMounted) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(request));
        } catch (error) {
          console.error('Error saving request to localStorage:', error);
        }
      }
    }, [request, isMounted]);

    useEffect(() => {
      if (isMounted) {
        updateUrl(request);
      }
    }, [request, updateUrl, isMounted]);

    useEffect(() => {
      setRequest((prev) => ({
        ...prev,
        headers: headersArrayToObject(headers),
      }));
    }, [headers]);

    const executeRequest = useCallback(async () => {
      try {
        await execute({
          method: request.method,
          url: request.url,
          headers: request.headers,
          body: request.body,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        message.error(t('requestFailed') + errorMessage);
      }
    }, [request, execute, t]);

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
        setRequest((prev) => ({ ...prev, url: requestUrl }));

        setTimeout(() => {
          executeRequest();
        }, 100);
        return;
      }

      try {
        await execute({
          method: request.method,
          url: requestUrl,
          headers: request.headers,
          body: request.body,
        });

        message.success(t('requestSuccess'));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        message.error(t('requestFailed') + errorMessage);
      }
    }, [request, execute, executeRequest, t]);

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

    if (!isMounted) {
      return (
        <section className={styles.section}>
          <Card className={styles.card}>
            <div className={styles['loading-container']}>
              <Spin size="large" />
            </div>
          </Card>
        </section>
      );
    }

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

            <VariablesInfo
              url={request.url}
              headers={request.headers}
              body={request.body}
              variables={variables}
            />
          </div>
        </Card>
      </section>
    );
  }
);

RestClientPage.displayName = 'RestClientPage';

export default RestClientPage;
