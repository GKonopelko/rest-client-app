import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest';
import HistoryPage from './HistoryPage';
import { Provider } from 'react-redux';
import * as historyService from '@/lib/firebase/historyService';
import { NextIntlClientProvider } from 'next-intl';
import {
  Store,
  Observer,
  Unsubscribe,
  Reducer,
  Observable,
  Dispatch,
  Action,
} from 'redux';

interface FirestoreHistoryItem {
  id: string;
  timestamp?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  error?: string;
  requestSize?: number;
  responseSize?: number;
  latency?: number;
  requestHeaders?: string;
  requestBody?: string;
}

interface RootState {
  user: { id: string };
}

interface MockActionPayload {
  [key: string]: string | number | boolean | object | undefined;
}

type MockAction = Action<string> & MockActionPayload;

export function createMockStore(
  initialState: RootState
): Store<RootState, MockAction> {
  const store: Store<RootState, MockAction> = {
    getState: () => initialState,
    dispatch: ((action: MockAction) => action) as Dispatch<MockAction>,
    subscribe: () => (() => {}) as Unsubscribe,
    replaceReducer: (_: Reducer<RootState, MockAction>) => {},
    [Symbol.observable]: function () {
      const observable: Observable<RootState> = {
        subscribe: (observer: Observer<RootState>) => {
          observer.next?.(initialState);
          return { unsubscribe: () => {} };
        },
        [Symbol.observable]() {
          return this;
        },
      };
      return observable;
    },
  };
  return store;
}

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    pathname: '',
    query: {},
    asPath: '',
  }),
}));

const messages = {
  HistoryPage: {
    title: 'History',
    timestamp: 'Time',
    url: 'URL',
    method: 'Method',
    statusCode: 'Status',
    requestSize: 'Request Size',
    responseSize: 'Response Size',
    latency: 'Latency',
    error: 'Error',
    annotation: 'No data.',
    restClientLink: 'Go to Rest Client',
  },
};

function renderWithProviders(store: Store<RootState>) {
  return render(
    <Provider store={store}>
      <NextIntlClientProvider locale="en" messages={messages}>
        <HistoryPage />
      </NextIntlClientProvider>
    </Provider>
  );
}

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
});

describe('HistoryPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders the title', () => {
    const store = createMockStore({ user: { id: '123' } });
    renderWithProviders(store);
    expect(screen.getByText('History')).toBeDefined();
  });

  it('shows placeholder when there is no history', async () => {
    const store = createMockStore({ user: { id: '123' } });
    vi.spyOn(historyService, 'fetchHistory').mockResolvedValue(
      [] as FirestoreHistoryItem[]
    );

    renderWithProviders(store);

    await waitFor(() => {
      expect(screen.getByText('No data.')).toBeDefined();
      expect(screen.getByText('Go to Rest Client').getAttribute('href')).toBe(
        '/rest-client'
      );
    });
  });

  it('shows a table with history', async () => {
    const store = createMockStore({ user: { id: '123' } });
    const mockHistory: FirestoreHistoryItem[] = [
      {
        id: '1',
        timestamp: '2025-09-22T10:00:00Z',
        url: 'https://api.test.com',
        method: 'GET',
        statusCode: 200,
        requestSize: 100,
        responseSize: 200,
        latency: 50,
        error: '',
        requestHeaders: '{}',
        requestBody: '{}',
      },
    ];
    vi.spyOn(historyService, 'fetchHistory').mockResolvedValue(mockHistory);

    renderWithProviders(store);

    await waitFor(() => {
      expect(screen.getByText('https://api.test.com')).toBeDefined();
      expect(screen.getByText('GET')).toBeDefined();
    });
  });

  it('saves data to localStorage and navigates to rest-client on row click', async () => {
    const store = createMockStore({ user: { id: '123' } });
    const mockHistory: FirestoreHistoryItem[] = [
      {
        id: '1',
        timestamp: '2025-09-22T10:00:00Z',
        url: 'https://api.test.com',
        method: 'POST',
        statusCode: 201,
        requestSize: 150,
        responseSize: 300,
        latency: 70,
        error: '',
        requestHeaders: '{}',
        requestBody: '{}',
      },
    ];
    vi.spyOn(historyService, 'fetchHistory').mockResolvedValue(mockHistory);

    renderWithProviders(store);

    await waitFor(() => {
      expect(screen.getByText('https://api.test.com')).toBeDefined();
    });

    fireEvent.click(screen.getByText('https://api.test.com'));

    const savedData = JSON.parse(
      localStorage.getItem('rest-client-request-data') || '{}'
    );
    expect(savedData.url).toBe('https://api.test.com');
    expect(savedData.method).toBe('POST');
    expect(pushMock).toHaveBeenCalledWith('/rest-client');
  });

  it('renders table with history and displays data', async () => {
    const store = createMockStore({ user: { id: '123' } });
    const mockHistory: FirestoreHistoryItem[] = [
      {
        id: '1',
        timestamp: '2025-09-22T10:00:00Z',
        url: 'https://api.test.com',
        method: 'GET',
        statusCode: 200,
        requestSize: 100,
        responseSize: 200,
        latency: 50,
        error: '',
        requestHeaders: '{}',
        requestBody: '{}',
      },
    ];
    vi.spyOn(historyService, 'fetchHistory').mockResolvedValue(mockHistory);

    renderWithProviders(store);

    await waitFor(() => {
      expect(screen.getByText('https://api.test.com')).toBeDefined();
    });

    expect(screen.getByText('Time')).toBeDefined();
    expect(screen.getByText('URL')).toBeDefined();
    expect(screen.getByText('Method')).toBeDefined();
    expect(screen.getByText('Status')).toBeDefined();

    const row = screen.getByText('https://api.test.com').closest('tr');
    expect(row).toBeDefined();
    expect(row?.textContent).toContain('GET');
    expect(row?.textContent).toContain('200');
  });
});
