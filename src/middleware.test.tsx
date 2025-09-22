import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

vi.mock('next-intl/middleware', () => ({
  default: vi.fn(() => NextResponse.next()),
}));

vi.mock('./i18n/routing', () => ({
  routing: {
    locales: ['en', 'uk'],
  },
}));

import middleware from './middleware';

interface MockNextUrl {
  pathname: string;
  clone: Mock;
  search: string;
  hash: string;
  href: string;
  toString: Mock;
}

interface MockCookies {
  get: Mock;
}

interface MockRequest {
  nextUrl: MockNextUrl;
  cookies: MockCookies;
  url: string;
}

describe('Middleware', () => {
  let mockRequest: MockRequest;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {
      nextUrl: {
        pathname: '/',
        clone: vi.fn().mockReturnValue({
          pathname: '/',
          search: '',
          hash: '',
          href: 'http://localhost:3000/',
          toString: vi.fn().mockReturnValue('http://localhost:3000/'),
        }),
        search: '',
        hash: '',
        href: 'http://localhost:3000/',
        toString: vi.fn().mockReturnValue('http://localhost:3000/'),
      },
      cookies: {
        get: vi.fn(),
      },
      url: 'http://localhost:3000',
    };
  });

  const createMockResponse = (
    pathname: string,
    token?: string,
    locale?: string
  ) => {
    const cookies = new Map();
    if (locale) {
      cookies.set('NEXT_LOCALE', { name: 'NEXT_LOCALE', value: locale });
    }
    if (token) {
      cookies.set('token', { name: 'token', value: token });
    }

    mockRequest.cookies.get.mockImplementation((name: string) => {
      return cookies.get(name);
    });

    const request = {
      ...mockRequest,
      nextUrl: {
        ...mockRequest.nextUrl,
        pathname,
        clone: vi.fn().mockReturnValue({
          pathname: `/${locale || 'en'}${pathname}`,
          search: '',
          hash: '',
          href: `http://localhost:3000/${locale || 'en'}${pathname}`,
          toString: vi
            .fn()
            .mockReturnValue(
              `http://localhost:3000/${locale || 'en'}${pathname}`
            ),
        }),
        href: `http://localhost:3000${pathname}`,
        toString: vi.fn().mockReturnValue(`http://localhost:3000${pathname}`),
      },
    };

    return middleware(request as unknown as NextRequest);
  };

  it('should allow API routes without redirection', () => {
    const response = createMockResponse('/api/test');
    expect(response).toEqual(NextResponse.next());
  });

  it('should allow _next routes without redirection', () => {
    const response = createMockResponse('/_next/test');
    expect(response).toEqual(NextResponse.next());
  });

  it('should allow static files without redirection', () => {
    const response = createMockResponse('/test.jpg');
    expect(response).toEqual(NextResponse.next());
  });

  it('should redirect to path with locale when missing', () => {
    const response = createMockResponse('/test');
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/en/test'
    );
  });

  it('should use cookie locale for redirection', () => {
    const response = createMockResponse('/test', undefined, 'uk');
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/uk/test'
    );
  });

  it('should redirect to sign-in for protected routes without token', () => {
    const response = createMockResponse('/en/rest-client');
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/en/sign-in'
    );
  });

  it('should redirect authenticated users away from auth pages', () => {
    const response = createMockResponse('/en/sign-in', 'valid-token');
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/en');
  });

  it('should handle multiple protected routes', () => {
    const routes = ['/en/rest-client', '/en/history', '/en/variables'];

    routes.forEach((route) => {
      const response = createMockResponse(route);
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/en/sign-in'
      );
    });
  });

  it('should handle multiple auth pages', () => {
    const pages = ['/en/sign-in', '/en/sign-up'];

    pages.forEach((page) => {
      const response = createMockResponse(page, 'valid-token');
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/en');
    });
  });
});
