import { RequestData, ResponseData } from '@/views/RestClientPage/types';

export const executeRequest = async (
  request: RequestData
): Promise<ResponseData> => {
  const startTime = Date.now();

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
    const time = Date.now() - startTime;

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers,
      body,
      time,
    };
  } catch (error) {
    const time = Date.now() - startTime;
    return {
      status: 0,
      statusText: 'Network Error',
      headers: {},
      body: error instanceof Error ? error.message : 'Network request failed',
      time,
    };
  }
};
