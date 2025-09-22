import { render, screen } from '@testing-library/react';
import Footer from './Footer';
import { describe, it, expect, vi } from 'vitest';

interface ImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

interface TextProps {
  children: React.ReactNode;
  className?: string;
}

interface LinkProps {
  children: React.ReactNode;
  href: string;
  target?: string;
  rel?: string;
  className?: string;
}

vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, className }: ImageProps) => (
    <div
      className={className}
      data-testid="next-image"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundImage: `url(${src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      role="img"
      aria-label={alt}
    />
  ),
}));

vi.mock('antd', () => ({
  Typography: {
    Text: ({ children, className }: TextProps) => (
      <span className={className}>{children}</span>
    ),
    Link: ({ children, href, target, rel, className }: LinkProps) => (
      <a href={href} target={target} rel={rel} className={className}>
        {children}
      </a>
    ),
  },
}));

describe('Footer Component', () => {
  it('renders current year', () => {
    const currentYear = new Date().getFullYear();
    render(<Footer />);
    expect(screen.getByText(`© ${currentYear}`)).toBeInTheDocument();
  });

  it('renders all contributor links with correct attributes', () => {
    render(<Footer />);

    const aleksandrLink = screen.getByText('Aleksandr');
    const alekseyLink = screen.getByText('Aleksey');
    const grigoriLink = screen.getByText('Grigori');

    expect(aleksandrLink).toHaveAttribute(
      'href',
      'https://github.com/sashapervykh'
    );
    expect(aleksandrLink).toHaveAttribute('target', '_blank');
    expect(aleksandrLink).toHaveAttribute('rel', 'noopener noreferrer');

    expect(alekseyLink).toHaveAttribute('href', 'https://github.com/Forlocks');
    expect(alekseyLink).toHaveAttribute('target', '_blank');
    expect(alekseyLink).toHaveAttribute('rel', 'noopener noreferrer');

    expect(grigoriLink).toHaveAttribute(
      'href',
      'https://github.com/GKonopelko'
    );
    expect(grigoriLink).toHaveAttribute('target', '_blank');
    expect(grigoriLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders RS School logo with correct attributes', () => {
    render(<Footer />);

    const rsLogo = screen.getByRole('img', { name: 'RS School Logo' });
    expect(rsLogo).toHaveStyle({
      backgroundImage: 'url(/assets/icons/rss-logo.svg)',
      width: '80px',
      height: '30px',
    });

    const rsLink = rsLogo.closest('a');
    expect(rsLink).toHaveAttribute('href', 'https://rs.school/courses/reactjs');
    expect(rsLink).toHaveAttribute('target', '_blank');
    expect(rsLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders all elements in the document', () => {
    render(<Footer />);

    expect(screen.getByText('Aleksandr')).toBeInTheDocument();
    expect(screen.getByText('Aleksey')).toBeInTheDocument();
    expect(screen.getByText('Grigori')).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'RS School Logo' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(`© ${new Date().getFullYear()}`)
    ).toBeInTheDocument();
  });
});
