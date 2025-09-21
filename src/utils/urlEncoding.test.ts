import {
  encodeUnicode,
  decodeUnicode,
  encodeRequestToUrl,
  decodeRequestFromUrl,
  isValidBase64,
  decodeUnicodeFromBase64,
  getCurrentUrl,
  encodeRequestToSearchParams,
  decodeRequestFromSearchParams,
  createRestClientUrl,
  safeEncodeURIComponent,
  safeDecodeURIComponent,
  isUrlEncoded,
  normalizeUrl,
} from './urlEncoding';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('urlEncoding', () => {
  const mockRequest = {
    method: 'POST',
    url: 'https://api.example.com/users',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer token123',
    },
    body: '{"name": "John"}',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('encodeUnicode & decodeUnicode', () => {
    it('should encode and decode Unicode strings correctly', () => {
      const testString = 'Hello 世界! 🎉';
      const encoded = encodeUnicode(testString);
      const decoded = decodeUnicode(encoded);

      expect(decoded).toBe(testString);
      expect(encoded).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
    });

    it('should handle empty strings', () => {
      expect(encodeUnicode('')).toBe('');
      expect(decodeUnicode('')).toBe('');
    });

    it('should handle special characters', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/';
      const encoded = encodeUnicode(specialChars);
      const decoded = decodeUnicode(encoded);

      expect(decoded).toBe(specialChars);
    });
  });

  describe('encodeRequestToUrl', () => {
    it('should encode request to URL with all components', () => {
      const result = encodeRequestToUrl(
        mockRequest.method,
        mockRequest.url,
        mockRequest.headers,
        mockRequest.body,
        'en'
      );

      expect(result).toContain('/en/rest-client/POST/');
      expect(result).toContain('?Content-Type=');
      expect(result).toContain('Authorization=');
    });

    it('should handle empty URL', () => {
      const result = encodeRequestToUrl('GET', '', {}, '', 'en');
      expect(result).toBe('/en/rest-client/GET');
    });

    it('should handle empty body', () => {
      const result = encodeRequestToUrl(
        'GET',
        'https://test.com',
        {},
        '',
        'en'
      );
      expect(result).toContain('/en/rest-client/GET/');
      expect(result).not.toContain('//');
    });

    it('should handle empty headers', () => {
      const result = encodeRequestToUrl(
        'GET',
        'https://test.com',
        {},
        'body',
        'en'
      );
      expect(result).not.toContain('?');
    });
  });

  describe('decodeRequestFromUrl', () => {
    it('should decode request from URL with all components', () => {
      const encodedUrl = encodeRequestToUrl(
        mockRequest.method,
        mockRequest.url,
        mockRequest.headers,
        mockRequest.body,
        'en'
      );

      const url = new URL(`http://localhost${encodedUrl}`);
      const result = decodeRequestFromUrl(url.pathname, url.searchParams);

      expect(result).toEqual(mockRequest);
    });

    it('should return null for invalid pathname', () => {
      expect(
        decodeRequestFromUrl('/other/path', new URLSearchParams())
      ).toBeNull();
      expect(decodeRequestFromUrl(null, new URLSearchParams())).toBeNull();
    });

    it('should handle missing URL and body components', () => {
      const pathname = '/en/rest-client/GET';
      const result = decodeRequestFromUrl(pathname, new URLSearchParams());

      expect(result).toEqual({
        method: 'GET',
        url: '',
        headers: {},
        body: '',
      });
    });

    it('should handle malformed base64 in headers', () => {
      const searchParams = new URLSearchParams();
      searchParams.set('Content-Type', 'invalid-base64!!');

      const result = decodeRequestFromUrl(
        '/en/rest-client/GET/test',
        searchParams
      );

      expect(result?.headers['Content-Type']).toBe('');
    });
  });

  describe('isValidBase64 & decodeUnicodeFromBase64', () => {
    it('should validate base64 strings', () => {
      expect(isValidBase64('SGVsbG8g5LiW55WM')).toBe(true);
      expect(isValidBase64('invalid!!')).toBe(false);
      expect(isValidBase64('')).toBe(false);
    });

    it('should decode valid base64 strings', () => {
      const result = decodeUnicodeFromBase64('SGVsbG8g5LiW55WM');
      expect(result).toBe('Hello 世界');
    });

    it('should return empty string for invalid base64', () => {
      expect(decodeUnicodeFromBase64('invalid!!')).toBe('');
    });
  });

  describe('getCurrentUrl', () => {
    it('should return current URL in browser environment', () => {
      const mockLocation = {
        pathname: '/test',
        search: '?param=value',
      };

      vi.stubGlobal('window', {
        location: mockLocation,
      });

      expect(getCurrentUrl()).toBe('/test?param=value');
    });

    it('should return empty string in server environment', () => {
      vi.stubGlobal('window', undefined);
      expect(getCurrentUrl()).toBe('');
    });
  });

  describe('encodeRequestToSearchParams & decodeRequestFromSearchParams', () => {
    it('should encode and decode request using search params', () => {
      const params = encodeRequestToSearchParams(
        mockRequest.method,
        mockRequest.url,
        mockRequest.headers,
        mockRequest.body
      );

      const result = decodeRequestFromSearchParams(params);

      expect(result).toEqual(mockRequest);
    });

    it('should handle empty values', () => {
      const params = encodeRequestToSearchParams('GET', '', {}, '');
      const result = decodeRequestFromSearchParams(params);

      expect(result).toEqual({
        method: 'GET',
        url: '',
        headers: {},
        body: '',
      });
    });
  });

  describe('createRestClientUrl', () => {
    it('should create rest client URL with search params', () => {
      const result = createRestClientUrl(
        mockRequest.method,
        mockRequest.url,
        mockRequest.headers,
        mockRequest.body,
        'en'
      );

      expect(result).toContain('/en/rest-client?');
      expect(result).toContain('method=POST');
      expect(result).toContain('url=');
    });
  });

  describe('safeEncodeURIComponent & safeDecodeURIComponent', () => {
    it('should safely encode and decode URI components', () => {
      const testString = 'test 世界!';
      const encoded = safeEncodeURIComponent(testString);
      const decoded = safeDecodeURIComponent(encoded);

      expect(decoded).toBe(testString);
    });

    it('should handle errors during encoding', () => {
      const encodeSpy = vi.spyOn(global, 'encodeURIComponent');
      encodeSpy.mockImplementation(() => {
        throw new Error('Test error');
      });

      expect(safeEncodeURIComponent('test')).toBe('');

      encodeSpy.mockRestore();
    });

    it('should handle errors during decoding', () => {
      const decodeSpy = vi.spyOn(global, 'decodeURIComponent');
      decodeSpy.mockImplementation(() => {
        throw new Error('Test error');
      });

      expect(safeDecodeURIComponent('test')).toBe('test');

      decodeSpy.mockRestore();
    });
  });

  describe('isUrlEncoded', () => {
    it('should detect URL encoded strings', () => {
      expect(isUrlEncoded('test%20world')).toBe(true);
      expect(isUrlEncoded('test world')).toBe(false);
      expect(isUrlEncoded('')).toBe(false);
    });
  });

  describe('normalizeUrl', () => {
    it('should normalize URLs with protocol', () => {
      expect(normalizeUrl('example.com')).toBe('https://example.com');
      expect(normalizeUrl('http://example.com')).toBe('http://example.com');
      expect(normalizeUrl('https://example.com')).toBe('https://example.com');
    });

    it('should handle empty URLs', () => {
      expect(normalizeUrl('')).toBe('');
    });
  });
});
