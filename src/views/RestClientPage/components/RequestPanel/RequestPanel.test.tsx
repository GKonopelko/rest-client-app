import { render, screen, fireEvent } from '@testing-library/react';
import { useTranslations } from 'next-intl';
import RequestPanel from './RequestPanel';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { RequestData } from '../../types';

interface MethodSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
  type?: string;
}

interface SpaceCompactProps {
  children: React.ReactNode;
}

vi.mock('./MethodSelector', () => ({
  default: ({ value, onChange }: MethodSelectorProps) => (
    <select
      data-testid="method-selector"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="GET">GET</option>
      <option value="POST">POST</option>
    </select>
  ),
}));

vi.mock('./UrlInput', () => ({
  default: ({ value, onChange, placeholder }: UrlInputProps) => (
    <input
      data-testid="url-input"
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock('@/components/CodeGenerator/CodeGenerator', () => ({
  default: () => <div data-testid="code-generator">Code Generator</div>,
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

vi.mock('antd', () => {
  const Button = ({ children, onClick, loading, type }: ButtonProps) => (
    <button
      data-testid="submit-button"
      data-loading={loading?.toString()}
      data-type={type}
      onClick={onClick}
    >
      {children}
    </button>
  );

  const Space = {
    Compact: ({ children }: SpaceCompactProps) => <div>{children}</div>,
  };

  return { Button, Space };
});

vi.mock('@ant-design/icons', () => ({
  SendOutlined: () => <span>SendIcon</span>,
}));

describe('RequestPanel Component', () => {
  const mockOnUpdate = vi.fn();
  const mockOnExecute = vi.fn();
  const mockUseTranslations = vi.fn();

  const defaultRequest: RequestData = {
    method: 'GET',
    url: '',
    headers: {},
    body: '',
  };

  beforeEach(() => {
    (useTranslations as Mock).mockReturnValue(mockUseTranslations);
    mockUseTranslations.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        request: 'Request',
        urlPlaceholder: 'Enter URL',
        submitButton: 'Send',
      };
      return translations[key] || key;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderRequestPanel = (
    props: Partial<React.ComponentProps<typeof RequestPanel>> = {}
  ) => {
    const defaultProps = {
      request: defaultRequest,
      onUpdate: mockOnUpdate,
      onExecute: mockOnExecute,
      isLoading: false,
    };

    return render(<RequestPanel {...{ ...defaultProps, ...props }} />);
  };

  it('renders title with correct translation', () => {
    renderRequestPanel();
    expect(screen.getByText('Request')).toBeInTheDocument();
  });

  it('renders all child components', () => {
    renderRequestPanel();

    expect(screen.getByTestId('method-selector')).toBeInTheDocument();
    expect(screen.getByTestId('url-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    expect(screen.getByTestId('code-generator')).toBeInTheDocument();
  });

  it('passes correct props to MethodSelector', () => {
    const request = { ...defaultRequest, method: 'POST' };
    renderRequestPanel({ request });

    const methodSelector = screen.getByTestId('method-selector');
    expect(methodSelector).toHaveValue('POST');
  });

  it('passes correct props to UrlInput', () => {
    const request = { ...defaultRequest, url: 'https://api.example.com' };
    renderRequestPanel({ request });

    const urlInput = screen.getByTestId('url-input');
    expect(urlInput).toHaveValue('https://api.example.com');
    expect(urlInput).toHaveAttribute('placeholder', 'Enter URL');
  });

  it('calls onUpdate when method changes', () => {
    renderRequestPanel();

    const methodSelector = screen.getByTestId('method-selector');
    fireEvent.change(methodSelector, { target: { value: 'POST' } });

    expect(mockOnUpdate).toHaveBeenCalledWith({ method: 'POST' });
  });

  it('calls onUpdate when URL changes', () => {
    renderRequestPanel();

    const urlInput = screen.getByTestId('url-input');
    fireEvent.change(urlInput, {
      target: { value: 'https://api.example.com' },
    });

    expect(mockOnUpdate).toHaveBeenCalledWith({
      url: 'https://api.example.com',
    });
  });

  it('calls onExecute when submit button is clicked', () => {
    renderRequestPanel();

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    expect(mockOnExecute).toHaveBeenCalled();
  });

  it('disables submit button when isLoading is true', () => {
    renderRequestPanel({ isLoading: true });

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toHaveAttribute('data-loading', 'true');
  });

  it('displays loading state on submit button', () => {
    renderRequestPanel({ isLoading: true });

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toHaveAttribute('data-loading', 'true');
  });
});
