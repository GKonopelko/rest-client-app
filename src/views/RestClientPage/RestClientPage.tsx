'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { Card, Typography, message } from 'antd';
import { useLocale, useTranslations } from 'next-intl';
import styles from './RestClient.module.css';

import RequestPanel from './components/RequestPanel/RequestPanel';
import HeadersPanel from './components/HeadersPanel/HeadersPanel';
import ResponsePanel from './components/ResponsePanel/ResponsePanel';
import BodyPanel from './components/BodyPanel/BodyPanel';
import VariablesInfo from './components/VariablesInfo/VariablesInfo';

import { useRequestHandler } from './hooks/useRequestHandler';
import { useVariables } from './hooks/useVariables';
import { useUrlSync } from './hooks/useUrlSync';
import { RequestData, Header, ResponseData } from './types';
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
    const locale = useLocale();
    const [isMounted, setIsMounted] = useState(false);
    const [isLocaleChanging, setIsLocaleChanging] = useState(false);
    const [request, setRequest] = useState<RequestData>({
      method: 'GET',
      url: '',
      headers: {},
      body: '',
    });
    const [headers, setHeaders] = useState<Header[]>([]);

    const { variables } = useVariables();
    const t = useTranslations('RestClientPage');

    const handleResult = useCallback(
      (result: ResponseData) => {
        if (result.status >= 400 || result.status === 0) {
          const errorMsg =
            result.status === 0
              ? `Network Error: ${result.body}`
              : `HTTP ${result.status}: ${result.statusText || 'Request failed'}`;

          message.error(t('requestFailed') + errorMsg);
        } else {
          message.success(t('requestSuccess'));
        }
      },
      [t]
    );

    const { response, isLoading, error, execute } = useRequestHandler({
      variables,
    });

    const { updateUrl } = useUrlSync();

    useEffect(() => {
      setIsMounted(true);

      const handleLocaleChange = () => {
        setIsLocaleChanging(true);
        const timeoutId = setTimeout(() => setIsLocaleChanging(false), 1000);
        return () => clearTimeout(timeoutId);
      };

      window.addEventListener('localechange', handleLocaleChange);

      return () => {
        window.removeEventListener('localechange', handleLocaleChange);
      };
    }, []);

    useEffect(() => {
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
      if (isMounted && !isLocaleChanging) {
        updateUrl(request);
      }
    }, [request, updateUrl, isMounted, locale, isLocaleChanging]);

    useEffect(() => {
      setRequest((prev) => ({
        ...prev,
        headers: headersArrayToObject(headers),
      }));
    }, [headers]);

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
          execute({ ...request, url: requestUrl }).then(handleResult);
        }, 100);
        return;
      }

      execute(request).then(handleResult);
    }, [request, execute, t, handleResult]);

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
