import { render, cleanup } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import userSlice from '@/slices/userSlice';
import RestClientPage from './RestClientPage';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key,
}));

vi.mock('antd', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Typography: {
    Title: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  },
  message: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('./components/RequestPanel/RequestPanel', () => ({
  default: () => <div>Request Panel</div>,
}));

vi.mock('./components/HeadersPanel/HeadersPanel', () => ({
  default: () => <div>Headers Panel</div>,
}));

vi.mock('./components/BodyPanel/BodyPanel', () => ({
  default: () => <div>Body Panel</div>,
}));

vi.mock('./components/ResponsePanel/ResponsePanel', () => ({
  default: () => <div>Response Panel</div>,
}));

vi.mock('./components/VariablesInfo/VariablesInfo', () => ({
  default: () => <div>Variables Info</div>,
}));

vi.mock('./hooks/useRequestHandler', () => ({
  useRequestHandler: () => ({
    response: null,
    isLoading: false,
    error: null,
    execute: vi.fn(),
  }),
}));

vi.mock('./hooks/useVariables', () => ({
  useVariables: () => ({
    variables: [],
  }),
}));

vi.mock('./hooks/useUrlSync', () => ({
  useUrlSync: () => ({
    updateUrl: vi.fn(),
  }),
}));

vi.mock('@/utils/headersUtils', () => ({
  headersArrayToObject: vi.fn(() => ({})),
  headersObjectToArray: vi.fn(() => []),
}));

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  return {
    ...actual,
    useEffect: (effect: () => (() => void) | undefined) => effect(),
    useState: (initial: unknown) => [initial, vi.fn()],
    useCallback: (callback: unknown) => callback,
  };
});

describe('RestClientPage', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        user: userSlice,
      },
    });

    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);

    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <Provider store={store}>
        <RestClientPage />
      </Provider>
    );

    expect(container).toBeInTheDocument();
  });

  it('handles locale change correctly', () => {
    const { container } = render(
      <Provider store={store}>
        <RestClientPage />
      </Provider>
    );

    const localeChangeEvent = new Event('localechange');
    window.dispatchEvent(localeChangeEvent);

    expect(container).toBeInTheDocument();

    vi.advanceTimersByTime(1000);

    expect(container).toBeInTheDocument();
  });

  it('handles localStorage parse errors gracefully when loading', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-json');

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const { container } = render(
      <Provider store={store}>
        <RestClientPage />
      </Provider>
    );

    expect(container).toBeInTheDocument();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error loading saved request:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it('renders all child components correctly', () => {
    const { getByText } = render(
      <Provider store={store}>
        <RestClientPage />
      </Provider>
    );

    expect(getByText('Request Panel')).toBeInTheDocument();
    expect(getByText('Headers Panel')).toBeInTheDocument();
    expect(getByText('Body Panel')).toBeInTheDocument();
    expect(getByText('Response Panel')).toBeInTheDocument();
    expect(getByText('Variables Info')).toBeInTheDocument();
  });

  it('loads saved request from localStorage on mount', () => {
    const savedRequest = {
      method: 'POST',
      url: 'https://saved.example.com',
      headers: { 'Content-Type': 'application/json' },
      body: '{"saved": true}',
    };

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedRequest));

    const { container } = render(
      <Provider store={store}>
        <RestClientPage />
      </Provider>
    );

    expect(container).toBeInTheDocument();
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
      'rest-client-request-data'
    );
  });

  it('uses initial props when no saved data in localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const initialProps = {
      initialMethod: 'PUT',
      initialUrl: 'https://initial.example.com',
      initialBody: '{"initial": true}',
      initialHeaders: { 'X-Custom': 'value' },
    };

    const { container } = render(
      <Provider store={store}>
        <RestClientPage {...initialProps} />
      </Provider>
    );

    expect(container).toBeInTheDocument();
  });
});
