import { render, screen } from '@testing-library/react';
import { useTranslations } from 'next-intl';
import SignInPage from './SignInPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

vi.mock('@/components/LoginForm/LoginForm', () => ({
  LoginForm: () => <div data-testid="login-form">Login Form</div>,
}));

vi.mock('./SignInPage.module.css', () => ({
  default: {
    page: 'page-class',
    content: 'content-class',
  },
}));

describe('SignInPage', () => {
  const mockUseTranslations = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useTranslations as ReturnType<typeof vi.fn>).mockReturnValue(
      mockUseTranslations
    );
    mockUseTranslations.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        title: 'Sign In',
      };
      return translations[key] || key;
    });
  });

  it('renders the page with correct structure', () => {
    render(<SignInPage />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Sign In'
    );

    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('calls useTranslations with correct namespace', () => {
    render(<SignInPage />);
    expect(useTranslations).toHaveBeenCalledWith('SignInPage');
  });

  it('displays translated title', () => {
    mockUseTranslations.mockImplementation((key: string) => {
      if (key === 'title') return 'Вход в систему';
      return key;
    });

    render(<SignInPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Вход в систему'
    );
  });

  it('renders LoginForm component', () => {
    render(<SignInPage />);

    const loginForm = screen.getByTestId('login-form');
    expect(loginForm).toBeInTheDocument();
    expect(loginForm).toHaveTextContent('Login Form');
  });

  it('has correct container structure', () => {
    const { container } = render(<SignInPage />);

    expect(container.querySelector('div > section > h1')).toBeInTheDocument();
    expect(
      container.querySelector('div > section > div[data-testid="login-form"]')
    ).toBeInTheDocument();
  });
});
