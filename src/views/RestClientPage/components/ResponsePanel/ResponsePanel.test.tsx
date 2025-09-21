import { render, screen } from '@testing-library/react';
import ResponsePanel from './ResponsePanel';
import { ResponseData } from '../../types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/JsonEditor/JsonEditor', () => ({
  default: ({
    value,
    onChange,
    readOnly,
    height,
  }: {
    value: string;
    onChange: () => void;
    readOnly: boolean;
    height: string;
  }) => (
    <textarea
      data-testid="json-editor"
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      style={{ height }}
    />
  ),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('ResponsePanel Component', () => {
  let mockResponse: ResponseData;

  beforeEach(() => {
    mockResponse = {
      status: 200,
      statusText: 'OK',
      time: 150,
      body: '{"message": "Success"}',
      headers: {},
    };
  });

  const renderResponsePanel = (
    props: Partial<React.ComponentProps<typeof ResponsePanel>> = {}
  ) => {
    const defaultProps: React.ComponentProps<typeof ResponsePanel> = {
      response: undefined,
      error: undefined,
      isLoading: false,
    };

    return render(<ResponsePanel {...{ ...defaultProps, ...props }} />);
  };

  it('renders the response title', () => {
    renderResponsePanel();

    expect(
      screen.getByRole('heading', { level: 4, name: 'response' })
    ).toBeInTheDocument();
  });

  it('shows no response message when no response or error', () => {
    renderResponsePanel();

    expect(screen.getByText('noResponse')).toBeInTheDocument();
  });

  it('shows error alert when error is provided', () => {
    const errorMessage = 'Network error occurred';
    renderResponsePanel({ error: errorMessage });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Network error occurred')).toBeInTheDocument();
  });

  it('displays response information when response is provided', () => {
    renderResponsePanel({ response: mockResponse });

    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText('200 OK')).toBeInTheDocument();
    expect(screen.getByText('Time:')).toBeInTheDocument();
    expect(screen.getByText('150ms')).toBeInTheDocument();
    expect(screen.getByText('Size:')).toBeInTheDocument();
    expect(screen.getByText('22 bytes')).toBeInTheDocument();
  });

  it('displays JSON editor with response body when response is provided', () => {
    renderResponsePanel({ response: mockResponse });

    const jsonEditor = screen.getByTestId('json-editor');
    expect(jsonEditor).toBeInTheDocument();
    expect(jsonEditor).toHaveValue('{"message": "Success"}');
    expect(jsonEditor).toHaveAttribute('readOnly');
  });

  it('displays JSON editor with error message when error is provided', () => {
    const errorMessage = 'Network error';
    renderResponsePanel({ error: errorMessage });

    const jsonEditor = screen.getByTestId('json-editor');
    expect(jsonEditor).toBeInTheDocument();
    expect(jsonEditor).toHaveValue(`Error: ${errorMessage}`);
  });

  it('does not show JSON editor when no response and no error', () => {
    renderResponsePanel();

    expect(screen.queryByTestId('json-editor')).not.toBeInTheDocument();
  });

  it('does not show response info when no response', () => {
    renderResponsePanel();

    expect(screen.queryByText('Status:')).not.toBeInTheDocument();
    expect(screen.queryByText('Time:')).not.toBeInTheDocument();
    expect(screen.queryByText('Size:')).not.toBeInTheDocument();
  });

  it('calculates correct body size for empty response', () => {
    const emptyResponse: ResponseData = {
      ...mockResponse,
      body: '',
    };

    renderResponsePanel({ response: emptyResponse });

    expect(screen.getByText('0 bytes')).toBeInTheDocument();
  });

  it('does not show response info when only error is provided', () => {
    renderResponsePanel({ error: 'Error message' });

    expect(screen.queryByText('Status:')).not.toBeInTheDocument();
    expect(screen.queryByText('Time:')).not.toBeInTheDocument();
    expect(screen.queryByText('Size:')).not.toBeInTheDocument();
  });

  it('does not show no response message when loading', () => {
    renderResponsePanel({ isLoading: true });

    expect(screen.queryByText('noResponse')).not.toBeInTheDocument();
  });
});
