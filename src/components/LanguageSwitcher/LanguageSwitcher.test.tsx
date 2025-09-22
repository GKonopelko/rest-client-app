import { render, screen, fireEvent } from '@testing-library/react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import LanguageSwitcher from './LanguageSwitcher';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
}));

const mockSwitchLocale = vi.fn();
vi.mock('@/hooks/useSwitchLocale', () => ({
  useSwitchLocale: () => mockSwitchLocale,
}));

vi.mock('antd', () => ({
  Button: ({
    children,
    onClick,
    type,
    icon,
    'aria-label': ariaLabel,
    size,
    className,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    type?: string;
    icon?: React.ReactNode;
    'aria-label'?: string;
    size?: string;
    className?: string;
  }) => (
    <button
      onClick={onClick}
      data-type={type}
      aria-label={ariaLabel}
      data-size={size}
      className={className}
    >
      {icon}
      {children}
    </button>
  ),
  Space: {
    Compact: ({
      children,
      className,
    }: {
      children: React.ReactNode;
      className?: string;
    }) => <div className={className}>{children}</div>,
  },
}));

vi.mock('@ant-design/icons', () => ({
  GlobalOutlined: () => <span data-testid="global-icon" />,
}));

const mockUseTranslations = vi.fn();
const mockUseParams = vi.fn();

describe('LanguageSwitcher Component', () => {
  beforeEach(() => {
    (useTranslations as Mock).mockReturnValue(mockUseTranslations);
    (useParams as Mock).mockImplementation(mockUseParams);
    mockSwitchLocale.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders with text when showText is true', () => {
    mockUseParams.mockReturnValue({ locale: 'en' });
    mockUseTranslations.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        localeEn: 'English',
        localeRu: 'Russian',
      };
      return translations[key] || key;
    });

    render(<LanguageSwitcher showText={true} />);

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Russian')).toBeInTheDocument();
  });

  it('renders without text when showText is false', () => {
    mockUseParams.mockReturnValue({ locale: 'en' });
    mockUseTranslations.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        localeEn: 'English',
        localeRu: 'Russian',
      };
      return translations[key] || key;
    });

    render(<LanguageSwitcher showText={false} />);

    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('RU')).toBeInTheDocument();
  });

  it('shows primary type for current locale', () => {
    mockUseParams.mockReturnValue({ locale: 'en' });
    mockUseTranslations.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        localeEn: 'English',
        localeRu: 'Russian',
      };
      return translations[key] || key;
    });

    render(<LanguageSwitcher />);

    const enButton = screen.getByText('English');
    const ruButton = screen.getByText('Russian');

    expect(enButton).toHaveAttribute('data-type', 'primary');
    expect(ruButton).toHaveAttribute('data-type', 'default');
  });

  it('handles locale switch correctly', () => {
    mockUseParams.mockReturnValue({ locale: 'en' });
    mockUseTranslations.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        localeEn: 'English',
        localeRu: 'Russian',
      };
      return translations[key] || key;
    });

    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

    mockSwitchLocale.mockImplementation((locale: string) => {
      window.dispatchEvent(
        new CustomEvent('localechange', {
          detail: { from: 'en', to: locale },
        })
      );
    });

    render(<LanguageSwitcher />);

    fireEvent.click(screen.getByText('Russian'));

    expect(mockSwitchLocale).toHaveBeenCalledWith('ru');
    expect(dispatchEventSpy).toHaveBeenCalled();

    const dispatchedEvent = dispatchEventSpy.mock.calls[0][0] as CustomEvent;

    expect(dispatchedEvent.type).toBe('localechange');
    expect(dispatchedEvent.detail).toEqual({ from: 'en', to: 'ru' });

    dispatchEventSpy.mockRestore();
  });

  it('uses default locale when params.locale is not string', () => {
    mockUseParams.mockReturnValue({ locale: undefined });
    mockUseTranslations.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        localeEn: 'English',
        localeRu: 'Russian',
      };
      return translations[key] || key;
    });

    render(<LanguageSwitcher />);

    const enButton = screen.getByText('English');
    expect(enButton).toHaveAttribute('data-type', 'primary');
  });

  it('applies custom className', () => {
    mockUseParams.mockReturnValue({ locale: 'en' });
    mockUseTranslations.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        localeEn: 'English',
        localeRu: 'Russian',
      };
      return translations[key] || key;
    });

    const { container } = render(<LanguageSwitcher className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('shows icons when showText is false', () => {
    mockUseParams.mockReturnValue({ locale: 'en' });
    mockUseTranslations.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        localeEn: 'English',
        localeRu: 'Russian',
      };
      return translations[key] || key;
    });

    render(<LanguageSwitcher showText={false} />);

    expect(screen.getAllByTestId('global-icon')).toHaveLength(2);
  });

  it('has correct aria labels', () => {
    mockUseParams.mockReturnValue({ locale: 'en' });
    mockUseTranslations.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        localeEn: 'English',
        localeRu: 'Russian',
      };
      return translations[key] || key;
    });

    render(<LanguageSwitcher />);

    expect(screen.getByLabelText('English')).toBeInTheDocument();
    expect(screen.getByLabelText('Russian')).toBeInTheDocument();
  });
});
