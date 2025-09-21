import { render, screen, fireEvent } from '@testing-library/react';
import HeadersEditor from './HeadersEditor';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('HeadersEditor Component', () => {
  const mockOnChange = vi.fn();

  const defaultProps = {
    headers: [{ key: 'Content-Type', value: 'application/json' }],
    onChange: mockOnChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders existing headers', () => {
    render(<HeadersEditor {...defaultProps} />);

    expect(screen.getByPlaceholderText('Header Key')).toHaveValue(
      'Content-Type'
    );
    expect(screen.getByPlaceholderText('Header Value')).toHaveValue(
      'application/json'
    );
    expect(screen.getByText('Add Header')).toBeInTheDocument();
  });

  it('calls onChange when adding a new header', () => {
    render(<HeadersEditor {...defaultProps} />);

    fireEvent.click(screen.getByText('Add Header'));

    expect(mockOnChange).toHaveBeenCalledWith([
      { key: 'Content-Type', value: 'application/json' },
      { key: '', value: '' },
    ]);
  });

  it('calls onChange when removing a header', () => {
    render(<HeadersEditor {...defaultProps} />);

    const removeButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(removeButton);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('calls onChange when updating header key', () => {
    render(<HeadersEditor {...defaultProps} />);

    const keyInput = screen.getByPlaceholderText('Header Key');
    fireEvent.change(keyInput, { target: { value: 'Authorization' } });

    expect(mockOnChange).toHaveBeenCalledWith([
      { key: 'Authorization', value: 'application/json' },
    ]);
  });

  it('calls onChange when updating header value', () => {
    render(<HeadersEditor {...defaultProps} />);

    const valueInput = screen.getByPlaceholderText('Header Value');
    fireEvent.change(valueInput, { target: { value: 'text/plain' } });

    expect(mockOnChange).toHaveBeenCalledWith([
      { key: 'Content-Type', value: 'text/plain' },
    ]);
  });

  it('renders multiple headers correctly', () => {
    const multipleHeaders = [
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Authorization', value: 'Bearer token' },
    ];

    render(<HeadersEditor headers={multipleHeaders} onChange={mockOnChange} />);

    const keyInputs = screen.getAllByPlaceholderText('Header Key');
    const valueInputs = screen.getAllByPlaceholderText('Header Value');
    const removeButtons = screen.getAllByRole('button', { name: /delete/i });

    expect(keyInputs).toHaveLength(2);
    expect(valueInputs).toHaveLength(2);
    expect(removeButtons).toHaveLength(2);

    expect(keyInputs[0]).toHaveValue('Content-Type');
    expect(valueInputs[0]).toHaveValue('application/json');
    expect(keyInputs[1]).toHaveValue('Authorization');
    expect(valueInputs[1]).toHaveValue('Bearer token');
  });

  it('renders empty state correctly', () => {
    render(<HeadersEditor headers={[]} onChange={mockOnChange} />);

    expect(screen.queryByPlaceholderText('Header Key')).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText('Header Value')
    ).not.toBeInTheDocument();
    expect(screen.getByText('Add Header')).toBeInTheDocument();
  });
});
