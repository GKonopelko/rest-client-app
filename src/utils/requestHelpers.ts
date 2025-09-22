import { RequestData, ResponseData } from '@/views/RestClientPage/types';

export interface RequestAnalytics {
  timestamp: string;
  latency: number;
  url: string;
  method: string;
  statusCode: number;
  error: string;
  requestSize: number;
  responseSize: number;
  requestBody: string;
  requestHeaders: string;
}

export interface RequestResult {
  response: ResponseData;
  analytics: RequestAnalytics;
}

export const executeRequest = async (
  request: RequestData
): Promise<RequestResult> => {
  const startTime = Date.now();

  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;
  const requestBody = JSON.stringify(request.body);
  const requestHeaders = JSON.stringify(request.headers);

  const encoder = new TextEncoder();

  try {
    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body:
        request.method === 'GET' || request.method === 'HEAD'
          ? undefined
          : request.body,
    });

    const body = await response.text();
    const latency = Date.now() - startTime;

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const requestPayload = request.body ?? '';
    const requestSize = encoder.encode(requestPayload).length;
    const responseSize = encoder.encode(body).length;

    const responseData: ResponseData = {
      status: response.status,
      statusText: response.statusText,
      headers,
      body,
      time: latency,
    };

    return {
      response: responseData,
      analytics: {
        timestamp,
        latency,
        url: request.url,
        method: request.method,
        statusCode: response.status,
        error: response.status >= 400 ? response.statusText : '',
        requestSize,
        responseSize,
        requestBody,
        requestHeaders,
      },
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Network request failed';

    const responseData: ResponseData = {
      status: 0,
      statusText: 'Network Error',
      headers: {},
      body: errorMessage,
      time: latency,
    };

    const requestPayload = request.body ?? '';
    const requestSize = encoder.encode(requestPayload).length;
    const responseSize = 0;

    return {
      response: responseData,
      analytics: {
        timestamp,
        latency,
        url: request.url,
        method: request.method,
        statusCode: 0,
        error: errorMessage,
        requestSize,
        responseSize,
        requestBody,
        requestHeaders,
      },
    };
  }
};
