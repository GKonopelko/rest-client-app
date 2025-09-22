import { render, screen } from '@testing-library/react';
import LoadingState from './LoadingState';
import { describe, it, expect } from 'vitest';

describe('LoadingState Component', () => {
  it('renders with default message', () => {
    render(<LoadingState />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('generic', { busy: true })).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const customMessage = 'Custom loading message';
    render(<LoadingState message={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'custom-class';
    const { container } = render(<LoadingState className={customClass} />);

    expect(container.firstChild).toHaveClass(customClass);
  });

  it('does not render message when empty string is provided', () => {
    render(<LoadingState message="" />);

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('renders spin indicator with correct attributes', () => {
    render(<LoadingState />);

    const spinElement = screen.getByRole('generic', { busy: true });
    expect(spinElement).toBeInTheDocument();
    expect(spinElement).toHaveAttribute('aria-busy', 'true');
  });

  it('renders large spin size', () => {
    render(<LoadingState />);

    const spinElement = screen.getByRole('generic', { busy: true });
    expect(spinElement).toHaveClass('ant-spin-lg');
  });

  it('renders card container', () => {
    render(<LoadingState />);

    expect(
      screen.getByText('Loading...').closest('.ant-card')
    ).toBeInTheDocument();
  });
});
