import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userSlice from '@/slices/userSlice';
import Header from './Header';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getAuth, signOut } from 'firebase/auth';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import type { Mock } from 'vitest';

const { mockUseBreakpoint } = vi.hoisted(() => ({
  mockUseBreakpoint: vi.fn(),
}));

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  type?: string;
  'aria-label'?: string;
  className?: string;
}

interface LinkProps {
  children?: React.ReactNode;
  href?: string;
  className?: string;
}

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('@/hooks/useScrollDetection', () => ({
  useScrollDetection: vi.fn(() => false),
}));

vi.mock('antd', () => ({
  Grid: {
    useBreakpoint: mockUseBreakpoint,
  },
  Button: ({
    children,
    onClick,
    icon,
    type,
    'aria-label': ariaLabel,
    className,
  }: ButtonProps) => (
    <button
      onClick={onClick}
      data-type={type}
      aria-label={ariaLabel}
      className={className}
    >
      {icon}
      {children}
    </button>
  ),
}));

vi.mock('@/components/Logo/Logo', () => ({
  Logo: () => <div data-testid="logo">Logo</div>,
}));

vi.mock('@/components/LanguageSwitcher/LanguageSwitcher', () => ({
  default: ({ showText }: { showText: boolean }) => (
    <div data-testid="language-switcher">
      {showText ? 'LanguageSwitcher' : ''}
    </div>
  ),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, className }: LinkProps) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
};

const mockUseTranslations = vi.fn();
const mockGetAuth = vi.fn();

describe('Header Component', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        user: userSlice,
      },
    });

    mockUseBreakpoint.mockReturnValue({ md: true });

    (useRouter as Mock).mockReturnValue(mockRouter);
    (usePathname as Mock).mockReturnValue('/');
    (useTranslations as Mock).mockImplementation((namespace: string) => {
      if (namespace === 'AppLayout') {
        return mockUseTranslations;
      }
      return vi.fn();
    });
    (getAuth as Mock).mockReturnValue(mockGetAuth);
    (signOut as Mock).mockResolvedValue(undefined);

    mockUseTranslations.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        signOutButton: 'Sign Out',
        signInButton: 'Sign In',
        signUpButton: 'Sign Up',
      };
      return translations[key] || key;
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderHeader = (userName = '') => {
    if (userName) {
      store = configureStore({
        reducer: {
          user: userSlice,
        },
        preloadedState: {
          user: {
            name: userName,
            email: 'test@example.com',
            token: 'test-token',
            refreshToken: 'test-refresh-token',
            id: 'test-id',
          },
        },
      });
    }

    return render(
      <Provider store={store}>
        <Header />
      </Provider>
    );
  };

  it('renders logo and language switcher', () => {
    renderHeader();
    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
  });

  it('shows sign in and sign up buttons when user is not logged in', () => {
    renderHeader();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('shows sign out button when user is logged in', () => {
    renderHeader('Test User');
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('navigates to sign in page when sign in button is clicked', () => {
    renderHeader();
    fireEvent.click(screen.getByText('Sign In'));
    expect(mockRouter.push).toHaveBeenCalledWith('/sign-in');
  });

  it('navigates to sign up page when sign up button is clicked', () => {
    renderHeader();
    fireEvent.click(screen.getByText('Sign Up'));
    expect(mockRouter.push).toHaveBeenCalledWith('/sign-up');
  });

  it('handles sign out successfully', async () => {
    renderHeader('Test User');
    fireEvent.click(screen.getByText('Sign Out'));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledWith(mockGetAuth);
      const userName = (store.getState() as { user: { name: string | null } })
        .user.name;
      expect(userName).toBeFalsy();
      expect(global.fetch).toHaveBeenCalledWith('/api/setToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: '' }),
      });

      expect(mockRouter.replace).toHaveBeenCalledWith('/');
    });
  });

  it('replaces route when on home page during sign out', async () => {
    (usePathname as Mock).mockReturnValue('/');
    renderHeader('Test User');
    fireEvent.click(screen.getByText('Sign Out'));

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/');
    });
  });

  it('pushes route when not on home page during sign out', async () => {
    (usePathname as Mock).mockReturnValue('/other-page');
    renderHeader('Test User');
    fireEvent.click(screen.getByText('Sign Out'));

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
  });

  it('handles sign out error', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    (signOut as Mock).mockRejectedValue(new Error('Sign out failed'));

    renderHeader('Test User');
    fireEvent.click(screen.getByText('Sign Out'));

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Sign out error:',
        expect.any(Error)
      );
    });

    consoleError.mockRestore();
  });

  it('hides button text on small screens', () => {
    mockUseBreakpoint.mockReturnValue({ md: false });

    renderHeader();
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
  });
});
