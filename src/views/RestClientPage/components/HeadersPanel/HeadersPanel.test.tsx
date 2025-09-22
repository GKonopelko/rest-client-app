import { render, screen } from '@testing-library/react';
import { useTranslations } from 'next-intl';
import HeadersPanel from './HeadersPanel';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { Header } from '../../types';

vi.mock('@/components/HeadersEditor/HeadersEditor', () => ({
  default: ({
    headers,
  }: {
    headers: Header[];
    onChange: (headers: Header[]) => void;
  }) => (
    <div data-testid="headers-editor">
      {headers.map((header, index) => (
        <div key={index}>
          {header.key}: {header.value}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

vi.mock('antd', () => ({
  Typography: {
    Title: ({
      level,
      children,
    }: {
      level: number;
      children: React.ReactNode;
    }) => <h1 data-level={level}>{children}</h1>,
  },
}));

interface HeadersPanelProps {
  headers: Header[];
  onChange: (headers: Header[]) => void;
}

describe('HeadersPanel Component', () => {
  const mockOnChange = vi.fn();
  const mockUseTranslations = vi.fn();

  beforeEach(() => {
    (useTranslations as Mock).mockReturnValue(mockUseTranslations);
    mockUseTranslations.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        headers: 'Headers',
      };
      return translations[key] || key;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderHeadersPanel = (props: Partial<HeadersPanelProps> = {}) => {
    const defaultProps: HeadersPanelProps = {
      headers: [],
      onChange: mockOnChange,
    };

    return render(<HeadersPanel {...{ ...defaultProps, ...props }} />);
  };

  it('renders title with correct translation', () => {
    renderHeadersPanel();
    expect(screen.getByText('Headers')).toBeInTheDocument();
  });

  it('renders HeadersEditor with correct props', () => {
    const testHeaders: Header[] = [
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Authorization', value: 'Bearer token' },
    ];

    renderHeadersPanel({ headers: testHeaders });

    const editor = screen.getByTestId('headers-editor');
    expect(editor).toBeInTheDocument();
    expect(
      screen.getByText('Content-Type: application/json')
    ).toBeInTheDocument();
    expect(screen.getByText('Authorization: Bearer token')).toBeInTheDocument();
  });

  it('passes empty headers array to HeadersEditor when no headers provided', () => {
    renderHeadersPanel({ headers: [] });

    const editor = screen.getByTestId('headers-editor');
    expect(editor).toBeInTheDocument();
    expect(editor.children).toHaveLength(0);
  });

  it('displays the correct initial headers', () => {
    const initialHeaders: Header[] = [
      { key: 'Accept', value: 'application/json' },
      { key: 'User-Agent', value: 'TestClient' },
    ];

    renderHeadersPanel({ headers: initialHeaders });

    expect(screen.getByText('Accept: application/json')).toBeInTheDocument();
    expect(screen.getByText('User-Agent: TestClient')).toBeInTheDocument();
  });

  it('renders title with correct heading level', () => {
    renderHeadersPanel();
    const title = screen.getByRole('heading');
    expect(title).toHaveAttribute('data-level', '4');
  });
});
