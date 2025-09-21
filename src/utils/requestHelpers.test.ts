import { executeRequest } from './requestHelpers';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('requestHelpers', () => {
  const mockRequest = {
    url: 'https://api.example.com/test',
    method: 'GET' as const,
    headers: { 'Content-Type': 'application/json' },
    body: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  describe('executeRequest', () => {
    it('should successfully execute request and return response data', async () => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        text: vi.fn().mockResolvedValue('{"data": "test"}'),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      const result = await executeRequest(mockRequest);

      expect(fetch).toHaveBeenCalledWith(mockRequest.url, {
        method: mockRequest.method,
        headers: mockRequest.headers,
        body: undefined,
      });

      expect(result).toEqual({
        response: {
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/json' },
          body: '{"data": "test"}',
          time: expect.any(Number),
        },
        analytics: {
          timestamp: expect.any(String),
          latency: expect.any(Number),
          url: mockRequest.url,
          method: mockRequest.method,
          statusCode: 200,
          error: '',
          requestSize: expect.any(Number),
          responseSize: expect.any(Number),
          requestBody: JSON.stringify(mockRequest.body),
          requestHeaders: JSON.stringify(mockRequest.headers),
        },
      });
    });

    it('should include body for non-GET/HEAD requests', async () => {
      const mockResponse = {
        status: 201,
        statusText: 'Created',
        headers: new Headers({}),
        text: vi.fn().mockResolvedValue(''),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const requestWithBody = {
        ...mockRequest,
        method: 'POST' as const,
        body: '{"data": "test"}',
      };

      const result = await executeRequest(requestWithBody);

      expect(fetch).toHaveBeenCalledWith(requestWithBody.url, {
        method: requestWithBody.method,
        headers: requestWithBody.headers,
        body: '{"data": "test"}',
      });

      expect(result.analytics.requestBody).toBe(
        JSON.stringify(requestWithBody.body)
      );
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network failure');
      global.fetch = vi.fn().mockRejectedValue(networkError);

      const result = await executeRequest(mockRequest);

      expect(result).toEqual({
        response: {
          status: 0,
          statusText: 'Network Error',
          headers: {},
          body: 'Network failure',
          time: expect.any(Number),
        },
        analytics: {
          timestamp: expect.any(String),
          latency: expect.any(Number),
          url: mockRequest.url,
          method: mockRequest.method,
          statusCode: 0,
          error: 'Network failure',
          requestSize: expect.any(Number),
          responseSize: 0,
          requestBody: JSON.stringify(mockRequest.body),
          requestHeaders: JSON.stringify(mockRequest.headers),
        },
      });
    });

    it('should handle non-Error network failures', async () => {
      global.fetch = vi.fn().mockRejectedValue('Unknown error');

      const result = await executeRequest(mockRequest);

      expect(result).toEqual({
        response: {
          status: 0,
          statusText: 'Network Error',
          headers: {},
          body: 'Network request failed',
          time: expect.any(Number),
        },
        analytics: {
          timestamp: expect.any(String),
          latency: expect.any(Number),
          url: mockRequest.url,
          method: mockRequest.method,
          statusCode: 0,
          error: 'Network request failed',
          requestSize: expect.any(Number),
          responseSize: 0,
          requestBody: JSON.stringify(mockRequest.body),
          requestHeaders: JSON.stringify(mockRequest.headers),
        },
      });
    });
  });
});
