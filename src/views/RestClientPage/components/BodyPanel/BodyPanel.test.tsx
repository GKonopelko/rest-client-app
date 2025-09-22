import { render, screen, fireEvent } from '@testing-library/react';
import { useTranslations } from 'next-intl';
import BodyPanel from './BodyPanel';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('@/components/JsonEditor/JsonEditor', () => ({
  default: ({
    value,
    onChange,
    readOnly,
    height,
  }: {
    value: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
    height?: string;
  }) => (
    <textarea
      data-testid="json-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      style={{ height }}
    />
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

interface BodyPanelProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

describe('BodyPanel Component', () => {
  const mockOnChange = vi.fn();
  const mockUseTranslations = vi.fn();

  beforeEach(() => {
    (useTranslations as Mock).mockReturnValue(mockUseTranslations);
    mockUseTranslations.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        body: 'Request Body',
      };
      return translations[key] || key;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderBodyPanel = (props: Partial<BodyPanelProps> = {}) => {
    const defaultProps: BodyPanelProps = {
      value: '',
      onChange: mockOnChange,
      readOnly: false,
    };

    return render(<BodyPanel {...{ ...defaultProps, ...props }} />);
  };

  it('renders title with correct translation', () => {
    renderBodyPanel();
    expect(screen.getByText('Request Body')).toBeInTheDocument();
  });

  it('renders JsonEditor with correct props', () => {
    const testValue = '{"test": "data"}';
    renderBodyPanel({ value: testValue });

    const editor = screen.getByTestId('json-editor');
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveValue(testValue);
  });

  it('passes readOnly prop to JsonEditor', () => {
    renderBodyPanel({ readOnly: true });

    const editor = screen.getByTestId('json-editor');
    expect(editor).toHaveAttribute('readonly');
  });

  it('passes height prop to JsonEditor', () => {
    renderBodyPanel();

    const editor = screen.getByTestId('json-editor');
    expect(editor).toHaveStyle('height: 200px');
  });

  it('calls onChange when JsonEditor value changes', () => {
    renderBodyPanel();

    const editor = screen.getByTestId('json-editor');
    const newValue = '{"new": "value"}';

    fireEvent.change(editor, { target: { value: newValue } });

    expect(mockOnChange).toHaveBeenCalledWith(newValue);
  });

  it('displays the correct initial value', () => {
    const initialValue = '{"initial": "data"}';
    renderBodyPanel({ value: initialValue });

    const editor = screen.getByTestId('json-editor');
    expect(editor).toHaveValue(initialValue);
  });
});
