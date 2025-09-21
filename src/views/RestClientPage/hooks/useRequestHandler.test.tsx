import { renderHook, act } from '@testing-library/react';
import { useRequestHandler } from './useRequestHandler';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import { executeRequest } from '@/utils/requestHelpers';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userSlice from '@/slices/userSlice';

// Моки
vi.mock('@/utils/requestHelpers', () => ({
  executeRequest: vi.fn(),
}));

vi.mock('@/utils/variablesUtils', () => ({
  interpolateVariables: vi.fn((value) => value),
}));

vi.mock('@/lib/firebase/historyService', () => ({
  saveRequest: vi.fn(),
}));

// Создаем полный mock состояния пользователя
const mockUserState = {
  userId: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  token: 'test-token',
  refreshToken: 'test-refresh-token',
  id: 'test-id',
  isLoading: false,
  error: null,
};

describe('useRequestHandler', () => {
  let executeRequestMock: Mock;
  let onSuccess: Mock;
  let onError: Mock;
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    executeRequestMock = vi.fn();
    onSuccess = vi.fn();
    onError = vi.fn();

    store = configureStore({
      reducer: {
        user: userSlice,
      },
      preloadedState: {
        user: mockUserState,
      },
    });

    vi.mocked(executeRequest).mockImplementation(executeRequestMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderHookWithProvider = (
    props: Parameters<typeof useRequestHandler>[0]
  ) => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    return renderHook(() => useRequestHandler(props), { wrapper });
  };

  it('should initialize with default values', () => {
    const { result } = renderHookWithProvider({
      variables: [],
      onSuccess,
      onError,
    });

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
    executeRequestMock.mockResolvedValue({
      response: mockResponse,
      analytics: {},
    });

    const { result } = renderHookWithProvider({
      variables: [],
      onSuccess,
      onError,
    });

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
    executeRequestMock.mockResolvedValue({
      response: mockErrorResponse,
      analytics: {},
    });

    const { result } = renderHookWithProvider({
      variables: [],
      onSuccess,
      onError,
    });

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
    executeRequestMock.mockResolvedValue({
      response: mockNetworkError,
      analytics: {},
    });

    const { result } = renderHookWithProvider({
      variables: [],
      onSuccess,
      onError,
    });

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

    const { result } = renderHookWithProvider({
      variables: [],
      onSuccess,
      onError,
    });

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

  it('should handle unknown error type', async () => {
    executeRequestMock.mockRejectedValue('Some string error');

    const { result } = renderHookWithProvider({
      variables: [],
      onSuccess,
      onError,
    });

    await act(async () => {
      await result.current.execute({
        method: 'GET',
        url: 'http://test.com',
        headers: {},
        body: '',
      });
    });

    expect(result.current.error).toBe('Unknown error');
    expect(result.current.isLoading).toBe(false);
    expect(onError).toHaveBeenCalledWith('Unknown error');
  });

  it('should return error response object when exception occurs', async () => {
    executeRequestMock.mockRejectedValue(new Error('Request failed'));

    const { result } = renderHookWithProvider({
      variables: [],
      onSuccess,
      onError,
    });

    let response: unknown;
    await act(async () => {
      response = await result.current.execute({
        method: 'GET',
        url: 'http://test.com',
        headers: {},
        body: '',
      });
    });

    expect(response).toEqual({
      status: 0,
      statusText: 'Exception',
      headers: {},
      body: 'Request failed',
      time: 0,
    });
  });
});
