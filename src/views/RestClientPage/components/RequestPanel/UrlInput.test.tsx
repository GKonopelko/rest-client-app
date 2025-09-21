import { render, screen, fireEvent } from '@testing-library/react';
import UrlInput from './UrlInput';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('antd', () => ({
  Input: ({
    value,
    onChange,
    placeholder,
    className,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
  }) => (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      className={className}
      onChange={onChange}
      data-testid="url-input"
    />
  ),
}));

describe('UrlInput Component', () => {
  const mockOnChange = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderUrlInput = (props = {}) => {
    const defaultProps = {
      value: '',
      onChange: mockOnChange,
      placeholder: 'Enter URL',
    };

    return render(<UrlInput {...{ ...defaultProps, ...props }} />);
  };

  it('renders with empty value by default', () => {
    renderUrlInput();
    const input = screen.getByTestId('url-input');
    expect(input).toHaveValue('');
  });

  it('displays the correct initial value', () => {
    const testUrl = 'https://api.example.com/users';
    renderUrlInput({ value: testUrl });

    const input = screen.getByTestId('url-input');
    expect(input).toHaveValue(testUrl);
  });

  it('displays placeholder text', () => {
    const placeholder = 'Enter API endpoint URL';
    renderUrlInput({ placeholder });

    const input = screen.getByPlaceholderText(placeholder);
    expect(input).toBeInTheDocument();
  });

  it('calls onChange when input value changes', () => {
    renderUrlInput();

    const input = screen.getByTestId('url-input');
    const newUrl = 'https://api.example.com/posts';

    fireEvent.change(input, { target: { value: newUrl } });

    expect(mockOnChange).toHaveBeenCalledWith(newUrl);
  });

  it('applies CSS class from styles module', () => {
    renderUrlInput();

    const input = screen.getByTestId('url-input');

    expect(input.className).toContain('url-input');
  });
});
