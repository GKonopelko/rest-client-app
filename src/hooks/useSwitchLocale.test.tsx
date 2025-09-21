import { renderHook, act } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useSwitchLocale } from './useSwitchLocale';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useLocale: vi.fn(),
}));

describe('useSwitchLocale', () => {
  let mockRouter: { push: Mock; replace?: Mock };
  let mockPathname: string;
  let mockLocale: string;

  beforeEach(() => {
    mockRouter = {
      push: vi.fn(),
      replace: vi.fn(),
    };
    mockPathname = '/en/home';
    mockLocale = 'en';

    (useRouter as Mock).mockReturnValue(mockRouter);
    (usePathname as Mock).mockReturnValue(mockPathname);
    (useLocale as Mock).mockReturnValue(mockLocale);

    Object.defineProperty(window, 'scrollTo', {
      value: vi.fn(),
      writable: true,
    });

    Object.defineProperty(document, 'cookie', {
      value: '',
      writable: true,
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should switch locale and update path correctly', () => {
    const { result } = renderHook(() => useSwitchLocale());

    const scrollY = 500;
    window.scrollY = scrollY;

    act(() => {
      result.current('fr');
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/fr/home');
    expect(document.cookie).toContain('NEXT_LOCALE=fr');
  });

  it('should handle path without current locale prefix', () => {
    (usePathname as Mock).mockReturnValue('/home');
    (useLocale as Mock).mockReturnValue('en');

    const { result } = renderHook(() => useSwitchLocale());

    act(() => {
      result.current('fr');
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/fr/home');
  });

  it('should handle root path', () => {
    (usePathname as Mock).mockReturnValue('/');
    (useLocale as Mock).mockReturnValue('en');

    const { result } = renderHook(() => useSwitchLocale());

    act(() => {
      result.current('fr');
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/fr/');
  });

  it('should preserve scroll position after locale switch', () => {
    const scrollY = 300;
    window.scrollY = scrollY;

    const { result } = renderHook(() => useSwitchLocale());

    act(() => {
      result.current('fr');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(window.scrollTo).toHaveBeenCalledWith(0, scrollY);
  });

  it('should set cookie with correct parameters', () => {
    const { result } = renderHook(() => useSwitchLocale());

    act(() => {
      result.current('es');
    });

    expect(document.cookie).toContain('NEXT_LOCALE=es');
    expect(document.cookie).toContain('max-age=31536000');
    expect(document.cookie).toContain('path=/');
  });

  it('should handle complex paths with multiple segments', () => {
    (usePathname as Mock).mockReturnValue('/en/blog/post-123');
    (useLocale as Mock).mockReturnValue('en');

    const { result } = renderHook(() => useSwitchLocale());

    act(() => {
      result.current('de');
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/de/blog/post-123');
  });

  it('should handle locale switch when current path is already in target locale', () => {
    (usePathname as Mock).mockReturnValue('/fr/about');
    (useLocale as Mock).mockReturnValue('fr');

    const { result } = renderHook(() => useSwitchLocale());

    act(() => {
      result.current('fr');
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/fr/about');
  });

  it('should handle special characters in path', () => {
    (usePathname as Mock).mockReturnValue('/en/search?q=test&page=1');
    (useLocale as Mock).mockReturnValue('en');

    const { result } = renderHook(() => useSwitchLocale());

    act(() => {
      result.current('ja');
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/ja/search?q=test&page=1');
  });

  it('should not break with empty path', () => {
    (usePathname as Mock).mockReturnValue('');
    (useLocale as Mock).mockReturnValue('en');

    const { result } = renderHook(() => useSwitchLocale());

    act(() => {
      result.current('fr');
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/fr');
  });
});
