import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MethodSelector from './MethodSelector';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('MethodSelector Component', () => {
  const mockOnChange = vi.fn();
  const user = userEvent.setup();

  const renderMethodSelector = (value = 'GET') => {
    return render(<MethodSelector value={value} onChange={mockOnChange} />);
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default value', () => {
    renderMethodSelector();

    expect(screen.getByTitle('GET')).toBeInTheDocument();
  });

  it('displays the correct initial value', () => {
    renderMethodSelector('POST');
    expect(screen.getByTitle('POST')).toBeInTheDocument();
  });

  it('calls onChange when method is selected', async () => {
    renderMethodSelector();

    const selector = screen.getByRole('combobox');
    await user.click(selector);

    const postOption = screen.getByText('POST', {
      selector: '.ant-select-item-option-content',
    });
    await user.click(postOption);

    expect(mockOnChange).toHaveBeenCalledWith('POST', expect.any(Object));
  });

  it('renders all HTTP methods', async () => {
    renderMethodSelector();

    const selector = screen.getByRole('combobox');
    await user.click(selector);

    const methods = [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'PATCH',
      'HEAD',
      'OPTIONS',
      'CONNECT',
      'TRACE',
    ];

    methods.forEach((method) => {
      const option = screen.getByText(method, {
        selector: '.ant-select-item-option-content',
      });
      expect(option).toBeInTheDocument();
    });
  });
});
