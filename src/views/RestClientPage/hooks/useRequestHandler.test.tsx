import { renderHook, act } from '@testing-library/react';
import { useRequestHandler } from './useRequestHandler';
import { useUrlSync } from './useUrlSync';
import { useVariables } from './useVariables';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import {
  loadVariablesFromStorage,
  saveVariablesToStorage,
  type Variable,
} from '@/utils/variablesUtils';
import { executeRequest } from '@/utils/requestHelpers';

vi.mock('@/utils/requestHelpers', () => ({
  executeRequest: vi.fn(),
}));

vi.mock('@/utils/variablesUtils', () => ({
  interpolateVariables: vi.fn((value) => value),
  loadVariablesFromStorage: vi.fn(() => []),
  saveVariablesToStorage: vi.fn(),
}));

const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    replace: mockReplace,
  })),
  usePathname: vi.fn(() => '/'),
}));

vi.mock('next-intl', () => ({
  useLocale: vi.fn(() => 'en'),
}));

vi.mock('@/utils/urlEncoding', () => ({
  encodeRequestToUrl: vi.fn(() => '/test-url'),
}));

describe('useRequestHandler', () => {
  let executeRequestMock: Mock;
  let onSuccess: Mock;
  let onError: Mock;

  beforeEach(() => {
    executeRequestMock = vi.fn();
    onSuccess = vi.fn();
    onError = vi.fn();

    vi.mocked(executeRequest).mockImplementation(executeRequestMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useRequestHandler({ variables: [], onSuccess, onError })
    );

    expect(result.current.response).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(typeof result.current.execute).toBe('function');
  });

  it('should handle successful request', async () => {
    const mockResponse = {
      status: 200,
      body: 'success',
      headers: {},
      statusText: 'OK',
      time: 100,
    };
    executeRequestMock.mockResolvedValue(mockResponse);

    const { result } = renderHook(() =>
      useRequestHandler({ variables: [], onSuccess, onError })
    );

    await act(async () => {
      await result.current.execute({
        method: 'GET',
        url: 'http://test.com',
        headers: {},
        body: '',
      });
    });

    expect(result.current.response).toEqual(mockResponse);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(onSuccess).toHaveBeenCalledWith(mockResponse);
  });

  it('should handle request error', async () => {
    const mockErrorResponse = {
      status: 404,
      body: 'Not found',
      headers: {},
      statusText: 'Not Found',
      time: 100,
    };
    executeRequestMock.mockResolvedValue(mockErrorResponse);

    const { result } = renderHook(() =>
      useRequestHandler({ variables: [], onSuccess, onError })
    );

    await act(async () => {
      await result.current.execute({
        method: 'GET',
        url: 'http://test.com',
        headers: {},
        body: '',
      });
    });

    expect(result.current.error).toBe('HTTP 404: Not Found');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.response).toBeUndefined();
    expect(onError).toHaveBeenCalledWith('HTTP 404: Not Found');
  });

  it('should handle network error', async () => {
    const mockNetworkError = {
      status: 0,
      body: 'Network error',
      headers: {},
      statusText: '',
      time: 0,
    };
    executeRequestMock.mockResolvedValue(mockNetworkError);

    const { result } = renderHook(() =>
      useRequestHandler({ variables: [], onSuccess, onError })
    );

    await act(async () => {
      await result.current.execute({
        method: 'GET',
        url: 'http://test.com',
        headers: {},
        body: '',
      });
    });

    expect(result.current.error).toBe('Network Error: Network error');
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle exception', async () => {
    executeRequestMock.mockRejectedValue(new Error('Request failed'));

    const { result } = renderHook(() =>
      useRequestHandler({ variables: [], onSuccess, onError })
    );

    await act(async () => {
      await result.current.execute({
        method: 'GET',
        url: 'http://test.com',
        headers: {},
        body: '',
      });
    });

    expect(result.current.error).toBe('Request failed');
    expect(result.current.isLoading).toBe(false);
    expect(onError).toHaveBeenCalledWith('Request failed');
  });
});

describe('useUrlSync', () => {
  beforeEach(() => {
    mockReplace.mockClear();
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
});

describe('useVariables', () => {
  it('should initialize with empty variables', () => {
    const { result } = renderHook(() => useVariables());

    expect(result.current.variables).toEqual([]);
    expect(typeof result.current.updateVariables).toBe('function');
  });

  it('should update variables and save to storage', () => {
    const saveVariablesToStorageMock = vi.fn();
    vi.mocked(saveVariablesToStorage).mockImplementation(
      saveVariablesToStorageMock
    );

    const { result } = renderHook(() => useVariables());

    const newVariables: Variable[] = [
      { id: '1', name: 'test', value: 'value' },
    ];

    act(() => {
      result.current.updateVariables(newVariables);
    });

    expect(result.current.variables).toEqual(newVariables);
    expect(saveVariablesToStorageMock).toHaveBeenCalledWith(newVariables);
  });

  it('should load variables from storage on mount', () => {
    const savedVariables: Variable[] = [
      { id: '1', name: 'saved', value: 'value' },
    ];
    vi.mocked(loadVariablesFromStorage).mockReturnValue(savedVariables);

    const { result } = renderHook(() => useVariables());

    expect(result.current.variables).toEqual(savedVariables);
  });
});
