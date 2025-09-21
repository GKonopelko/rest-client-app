import { render, screen } from '@testing-library/react';
import LazyLoader from './LazyLoader';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('./LoadingState', () => ({
  default: ({ message, size }: { message: string; size: number }) => (
    <div data-testid="loading-state" data-message={message} data-size={size}>
      {message}
    </div>
  ),
}));

const mockStore = {
  dynamicMock: vi.fn(),
};

vi.mock('next/dynamic', () => ({
  default: (...args: unknown[]) => mockStore.dynamicMock(...args),
}));

describe('LazyLoader', () => {
  const MockComponent = () => (
    <div data-testid="lazy-component">Lazy Component</div>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.dynamicMock.mockImplementation(() => MockComponent);
  });

  it('renders with default props', () => {
    render(<LazyLoader component="RestClientPage" />);
    expect(screen.getByTestId('lazy-component')).toBeInTheDocument();
  });

  it('renders loading state when dynamic returns loading component', () => {
    mockStore.dynamicMock.mockImplementationOnce(
      (_importer: unknown, options: { loading: React.ComponentType }) => {
        const LoadingComponent = options.loading;
        return LoadingComponent;
      }
    );

    render(
      <LazyLoader
        component="RestClientPage"
        loadingMessage="Custom loading..."
      />
    );

    expect(screen.getByText('Custom loading...')).toBeInTheDocument();
  });

  it('renders with custom size in loading state', () => {
    mockStore.dynamicMock.mockImplementationOnce(
      (_importer: unknown, options: { loading: React.ComponentType }) => {
        const LoadingComponent = options.loading;
        return LoadingComponent;
      }
    );

    render(<LazyLoader component="RestClientPage" size={64} />);

    const loadingState = screen.getByTestId('loading-state');
    expect(loadingState).toHaveAttribute('data-size', '64');
  });

  it('loads RestClientPage component', () => {
    render(<LazyLoader component="RestClientPage" />);
    expect(screen.getByTestId('lazy-component')).toBeInTheDocument();
  });

  it('loads VariablesPage component', () => {
    render(<LazyLoader component="VariablesPage" />);
    expect(screen.getByTestId('lazy-component')).toBeInTheDocument();
  });

  it('loads HistoryPage component', () => {
    render(<LazyLoader component="HistoryPage" />);
    expect(screen.getByTestId('lazy-component')).toBeInTheDocument();
  });

  it('passes correct size to loading component', () => {
    mockStore.dynamicMock.mockImplementationOnce(
      (_importer: unknown, options: { loading: React.ComponentType }) => {
        const LoadingComponent = options.loading;
        return LoadingComponent;
      }
    );

    render(
      <LazyLoader
        component="RestClientPage"
        size={32}
        loadingMessage="Loading..."
      />
    );

    const loadingState = screen.getByTestId('loading-state');
    expect(loadingState).toHaveAttribute('data-size', '32');
  });
});
