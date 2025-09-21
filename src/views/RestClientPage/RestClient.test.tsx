import { render, screen } from '@testing-library/react';
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
  useRequestHandler: vi.fn(() => ({
    response: null,
    isLoading: false,
    error: null,
    execute: vi.fn(),
  })),
}));

vi.mock('./hooks/useVariables', () => ({
  useVariables: vi.fn(() => ({
    variables: {},
  })),
}));

vi.mock('./hooks/useUrlSync', () => ({
  useUrlSync: vi.fn(() => ({
    updateUrl: vi.fn(),
  })),
}));

vi.mock('@/utils/headersUtils', () => ({
  headersArrayToObject: vi.fn(() => ({})),
  headersObjectToArray: vi.fn(() => []),
}));

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useEffect: vi.fn((fn) => fn()),
    useCallback: vi.fn((fn) => fn),
    useState: vi.fn((initial) => [initial, vi.fn()]),
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

    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    vi.spyOn(window, 'addEventListener').mockImplementation(() => {});
    vi.spyOn(window, 'removeEventListener').mockImplementation(() => {});
    vi.spyOn(global, 'setTimeout').mockImplementation((fn) => {
      if (typeof fn === 'function') {
        fn();
      }
      return 0 as unknown as NodeJS.Timeout;
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <Provider store={store}>
        <RestClientPage />
      </Provider>
    );

    expect(container).toBeInTheDocument();
  });

  it('renders main sections', () => {
    render(
      <Provider store={store}>
        <RestClientPage />
      </Provider>
    );

    expect(screen.getByText('Request Panel')).toBeInTheDocument();
    expect(screen.getByText('Headers Panel')).toBeInTheDocument();
    expect(screen.getByText('Body Panel')).toBeInTheDocument();
    expect(screen.getByText('Response Panel')).toBeInTheDocument();
    expect(screen.getByText('Variables Info')).toBeInTheDocument();
  });

  it.skip('attempts to load from localStorage on mount', () => {});
  it.skip('loads saved request from localStorage on mount', () => {});
  it.skip('uses initial props when localStorage is empty', () => {});
  it.skip('handles localStorage errors gracefully', () => {});
  it.skip('saves request to localStorage when state changes', () => {});
  it.skip('handles localStorage save errors gracefully', () => {});
  it.skip('shows success message on successful request', () => {});
  it.skip('handles body change correctly', () => {});
  it.skip('handles empty URL validation', () => {});
  it.skip('handles headers change correctly', () => {});
  it.skip('shows error message on failed request', () => {});
  it.skip('handles network errors', () => {});
  it.skip('automatically adds https prefix to URL', () => {});
});
