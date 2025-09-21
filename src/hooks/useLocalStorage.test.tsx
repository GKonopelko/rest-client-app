import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('useLocalStorage', () => {
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
  };

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
  });

  it('should return initial value when no localStorage value exists', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    expect(result.current[0]).toBe('initial');
  });

  it('should return parsed value from localStorage when exists', () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify('storedValue'));

    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    expect(result.current[0]).toBe('storedValue');
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('testKey');
  });

  it('should handle JSON parse error', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    mockLocalStorage.getItem.mockReturnValue('invalid json');

    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    expect(result.current[0]).toBe('initial');
    expect(consoleError).toHaveBeenCalledWith(
      'Error reading localStorage key "testKey":',
      expect.any(Error)
    );

    consoleError.mockRestore();
  });

  it('should set value to localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    act(() => {
      result.current[1]('newValue');
    });

    expect(result.current[0]).toBe('newValue');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'testKey',
      JSON.stringify('newValue')
    );
  });

  it('should set value using function', () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(5));

    const { result } = renderHook(() => useLocalStorage('testKey', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(6);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'testKey',
      JSON.stringify(6)
    );
  });

  it('should handle setItem error', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('Storage failed');
    });

    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    act(() => {
      result.current[1]('newValue');
    });

    expect(result.current[0]).toBe('newValue');
    expect(consoleError).toHaveBeenCalledWith(
      'Error setting localStorage key "testKey":',
      expect.any(Error)
    );

    consoleError.mockRestore();
  });

  it('should not set localStorage when not mounted', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
  });

  it('should work with complex objects', () => {
    const complexObject = { name: 'test', count: 42, nested: { value: true } };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(complexObject));

    const { result } = renderHook(() => useLocalStorage('testKey', {}));

    expect(result.current[0]).toEqual(complexObject);
  });
});
