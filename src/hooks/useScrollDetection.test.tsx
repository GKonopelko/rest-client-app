import { renderHook, act } from '@testing-library/react';
import { useScrollDetection } from './useScrollDetection';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('useScrollDetection', () => {
  let originalScrollY: number;

  beforeEach(() => {
    originalScrollY = window.scrollY;
    vi.useFakeTimers();
  });

  afterEach(() => {
    window.scrollY = originalScrollY;
    vi.useRealTimers();
  });

  it('should return false initially when scrollY is 0', () => {
    window.scrollY = 0;

    const { result } = renderHook(() => useScrollDetection());

    expect(result.current).toBe(false);
  });

  it('should return true when scrollY is greater than 100', () => {
    window.scrollY = 150;

    const { result } = renderHook(() => useScrollDetection());

    act(() => {
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe(true);
  });

  it('should return false when scrollY is exactly 100', () => {
    window.scrollY = 100;

    const { result } = renderHook(() => useScrollDetection());

    act(() => {
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe(false);
  });

  it('should update state on scroll events', () => {
    window.scrollY = 0;

    const { result } = renderHook(() => useScrollDetection());

    expect(result.current).toBe(false);

    act(() => {
      window.scrollY = 200;
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe(true);

    act(() => {
      window.scrollY = 50;
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe(false);
  });

  it('should use requestAnimationFrame for scroll handling', () => {
    const mockRequestAnimationFrame = vi.fn((cb) => {
      cb();
      return 1;
    });
    const originalRAF = window.requestAnimationFrame;

    Object.defineProperty(window, 'requestAnimationFrame', {
      value: mockRequestAnimationFrame,
      writable: true,
    });

    window.scrollY = 150;

    renderHook(() => useScrollDetection());

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(mockRequestAnimationFrame).toHaveBeenCalled();

    Object.defineProperty(window, 'requestAnimationFrame', {
      value: originalRAF,
      writable: true,
    });
  });

  it('should clean up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useScrollDetection());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });

  it('should handle multiple rapid scroll events with throttling', () => {
    window.scrollY = 0;

    const { result } = renderHook(() => useScrollDetection());

    const dispatchScroll = () => {
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(16);
    };

    act(() => {
      window.scrollY = 50;
      dispatchScroll();
      window.scrollY = 100;
      dispatchScroll();
      window.scrollY = 150;
      dispatchScroll();
    });

    expect(result.current).toBe(true);
  });
});
