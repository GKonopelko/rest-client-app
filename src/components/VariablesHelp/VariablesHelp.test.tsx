import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import VariablesHelp from './VariablesHelp';

describe('VariablesHelp Component', () => {
  it('renders collapse with header', () => {
    render(<VariablesHelp />);

    expect(screen.getByText('How to use variables')).toBeInTheDocument();

    const header = screen.getByRole('button', {
      name: /how to use variables/i,
    });
    expect(header).toBeInTheDocument();
  });

  it('expands and shows content when clicked', async () => {
    render(<VariablesHelp />);

    expect(screen.queryByText('Variable Format')).not.toBeInTheDocument();

    const header = screen.getByRole('button', {
      name: /how to use variables/i,
    });
    fireEvent.click(header);

    await waitFor(() => {
      expect(screen.getByText('Variable Format')).toBeInTheDocument();
    });

    expect(screen.getByText('Examples:')).toBeInTheDocument();
    expect(screen.getByText('Rules:')).toBeInTheDocument();

    expect(screen.getByText(/https:\/\/api\.example\.com/)).toBeInTheDocument();
    expect(screen.getByText(/Authorization/)).toBeInTheDocument();
    expect(screen.getByText(/userId/)).toBeInTheDocument();
  });
});
