import { RequestData, ResponseData } from '@/views/RestClientPage/types';

export const executeRequest = async (
  request: RequestData
): Promise<ResponseData> => {
  const startTime = Date.now();

  const response = await fetch(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.method === 'GET' ? undefined : request.body,
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
};
