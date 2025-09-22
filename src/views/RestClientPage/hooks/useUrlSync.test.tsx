import { renderHook, act } from '@testing-library/react';
import { useUrlSync } from './useUrlSync';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { encodeRequestToUrl } from '@/utils/urlEncoding';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useLocale: vi.fn(),
}));

vi.mock('@/utils/urlEncoding', () => ({
  encodeRequestToUrl: vi.fn(),
}));

describe('useUrlSync', () => {
  const mockReplace = vi.fn();
  const mockUseRouter = vi.mocked(useRouter);
  const mockUsePathname = vi.mocked(usePathname);
  const mockUseLocale = vi.mocked(useLocale);
  const mockEncodeRequestToUrl = vi.mocked(encodeRequestToUrl);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({
      replace: mockReplace,
      push: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    });
    mockUsePathname.mockReturnValue('/');
    mockUseLocale.mockReturnValue('en');
    mockEncodeRequestToUrl.mockReturnValue('/test-url');
  });

  it('should return updateUrl function', () => {
    const { result } = renderHook(() => useUrlSync());

    expect(result.current.updateUrl).toBeDefined();
    expect(typeof result.current.updateUrl).toBe('function');
  });

  it('should call router.replace when updateUrl is called', () => {
    const { result } = renderHook(() => useUrlSync());

    act(() => {
      result.current.updateUrl({
        method: 'GET',
        url: 'http://test.com',
        headers: {},
        body: '',
      });
    });

    expect(mockReplace).toHaveBeenCalledWith('/test-url', { scroll: false });
  });

  it('should not call router.replace when pathname is the same as newUrl', () => {
    mockEncodeRequestToUrl.mockReturnValue('/');
    const { result } = renderHook(() => useUrlSync());

    act(() => {
      result.current.updateUrl({
        method: 'GET',
        url: 'http://test.com',
        headers: {},
        body: '',
      });
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('should not update URL when locale changes', () => {
    mockUseLocale.mockReturnValue('en');
    const { result, rerender } = renderHook(() => useUrlSync());

    act(() => {
      result.current.updateUrl({
        method: 'GET',
        url: 'http://test.com',
        headers: {},
        body: '',
      });
    });

    expect(mockReplace).toHaveBeenCalledTimes(1);

    mockUseLocale.mockReturnValue('fr');
    rerender();

    act(() => {
      result.current.updateUrl({
        method: 'GET',
        url: 'http://test.com',
        headers: {},
        body: '',
      });
    });

    expect(mockReplace).toHaveBeenCalledTimes(1);
  });
});
