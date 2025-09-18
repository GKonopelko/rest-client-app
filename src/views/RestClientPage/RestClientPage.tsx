'use client';

import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Card, Typography, message } from 'antd';
import styles from './RestClient.module.css';

import RequestPanel from './components/RequestPanel/RequestPanel';
import HeadersPanel from './components/HeadersPanel/HeadersPanel';
import ResponsePanel from './components/ResponsePanel/ResponsePanel';
import BodyPanel from './components/BodyPanel/BodyPanel';

import { useRequestHandler } from './hooks/useRequestHandler';
import { RequestData, Header } from './types';
import {
  headersArrayToObject,
  headersObjectToArray,
} from '@/utils/headersUtils';
import { useUrlSync } from './hooks/useUrlSync';

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
    const isInitialized = useRef(false);

    const loadSavedRequest = (): RequestData => {
      if (typeof window === 'undefined') {
        return {
          method: initialMethod,
          url: initialUrl,
          headers: initialHeaders,
          body: initialBody,
        };
      }

      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
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

    const [request, setRequest] = useState<RequestData>(loadSavedRequest);
    const [headers, setHeaders] = useState<Header[]>(
      headersObjectToArray(request.headers)
    );

    const { response, isLoading, error, execute } = useRequestHandler();
    const { updateUrl } = useUrlSync();

    useEffect(() => {
      if (isInitialized.current) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(request));
        } catch (error) {
          console.error('Error saving request to localStorage:', error);
        }
      }
    }, [request]);

    useEffect(() => {
      if (!isInitialized.current) {
        isInitialized.current = true;
        return;
      }
    }, []);

    useEffect(() => {
      if (isInitialized.current) {
        updateUrl(request);
      }
    }, [request, updateUrl]);

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
        message.error('Request failed: ' + errorMessage);
      }
    }, [request, execute]);

    const handleExecute = useCallback(async () => {
      if (!request.url.trim()) {
        message.error('Please enter a URL');
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

        message.success('Request completed successfully');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        message.error('Request failed: ' + errorMessage);
      }
    }, [request, execute, executeRequest]);

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
            REST Client
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
        </Card>
      </section>
    );
  }
);

RestClientPage.displayName = 'RestClientPage';

export default RestClientPage;
