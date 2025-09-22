import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Logo } from './Logo';

describe('Logo Component', () => {
  it('should render the logo with correct text', () => {
    const { getByText } = render(<Logo />);
    expect(getByText('REST SPB')).toBeInTheDocument();
  });

  it('should have correct dimensions', () => {
    const { container } = render(<Logo />);
    const svgElement = container.querySelector('svg');

    expect(svgElement).toHaveAttribute('width', '180');
    expect(svgElement).toHaveAttribute('height', '60');
    expect(svgElement).toHaveAttribute('viewBox', '0 0 200 60');
  });

  it('should have correct text styling', () => {
    const { container } = render(<Logo />);
    const textElement = container.querySelector('text');

    expect(textElement).toHaveAttribute('x', '5');
    expect(textElement).toHaveAttribute('y', '35');
    expect(textElement).toHaveAttribute('font-size', '24');
    expect(textElement).toHaveAttribute('font-weight', '700');
    expect(textElement).toHaveAttribute('fill', '#1890ff');
  });

  it('should match snapshot', () => {
    const { container } = render(<Logo />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
