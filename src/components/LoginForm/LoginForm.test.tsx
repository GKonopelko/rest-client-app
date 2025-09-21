import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { LoginForm } from './LoginForm';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useLoginSchema } from '@/lib/zod/loginSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInWithEmailAndPassword: vi.fn(),
}));

vi.mock('@/lib/zod/loginSchema', () => ({
  useLoginSchema: vi.fn(),
}));

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn(),
}));

vi.mock('react-hook-form', () => ({
  useForm: vi.fn(),
  Controller: vi.fn(({ render }) => render({ field: {} })),
}));

vi.mock('./LoginForm.module.css', () => ({
  default: {
    form: 'form-class',
    label: 'label-class',
    field: 'field-class',
  },
}));

vi.mock('@/lib/firebase/firebase', () => ({
  app: {},
}));

describe('LoginForm Component', () => {
  let mockUseTranslations: Mock;
  let mockUseRouter: Mock;
  let mockSignInWithEmailAndPassword: Mock;
  let mockUseForm: Mock;
  let mockUseLoginSchema: Mock;

  beforeEach(() => {
    mockUseTranslations = vi.fn();
    mockUseRouter = vi.fn();
    mockSignInWithEmailAndPassword = vi.fn();
    mockUseForm = vi.fn();
    mockUseLoginSchema = vi.fn();

    (useTranslations as Mock).mockReturnValue(mockUseTranslations);
    (useRouter as Mock).mockReturnValue({ push: mockUseRouter });
    (signInWithEmailAndPassword as Mock).mockImplementation(
      mockSignInWithEmailAndPassword
    );
    (useForm as Mock).mockImplementation(mockUseForm);
    (useLoginSchema as Mock).mockReturnValue(mockUseLoginSchema);
    (zodResolver as Mock).mockReturnValue(vi.fn());

    mockUseTranslations.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        emailField: 'Email',
        emailPlaceholder: 'Enter your email',
        passwordField: 'Password',
        passwordPlaceholder: 'Enter your password',
        submitButton: 'Sign In',
      };
      return translations[key] || key;
    });

    mockUseForm.mockReturnValue({
      control: {},
      handleSubmit:
        (fn: (data: { email: string; password: string }) => void) =>
        (_e: React.FormEvent) => {
          fn({ email: 'test@example.com', password: 'password123' });
        },
      formState: {
        errors: {},
        isValid: true,
      },
    });

    mockSignInWithEmailAndPassword.mockResolvedValue({
      user: {
        getIdToken: vi.fn().mockResolvedValue('test-token'),
      },
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderLoginForm = () => {
    return render(<LoginForm />);
  };

  it('renders form fields with correct labels and placeholders', () => {
    renderLoginForm();

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter your password')
    ).toBeInTheDocument();
  });

  it('renders submit button', () => {
    renderLoginForm();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('handles form submission successfully', async () => {
    renderLoginForm();

    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    const form = submitButton.closest('form');

    if (!form) {
      throw new Error('Form not found');
    }

    await act(async () => {
      fireEvent.submit(form);
    });

    await waitFor(() => {
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.any(Object),
        'test@example.com',
        'password123'
      );
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/setToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'test-token' }),
      });
    });

    await waitFor(() => {
      expect(mockUseRouter).toHaveBeenCalledWith('/');
    });
  });

  it('disables submit button when form is invalid', () => {
    mockUseForm.mockReturnValue({
      control: {},
      handleSubmit: vi.fn(),
      formState: {
        errors: {
          email: { message: 'Email is required' },
          password: { message: 'Password is required' },
        },
        isValid: false,
      },
    });

    renderLoginForm();

    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    expect(submitButton).toBeDisabled();
  });

  it('shows validation errors', () => {
    mockUseForm.mockReturnValue({
      control: {},
      handleSubmit: vi.fn(),
      formState: {
        errors: {
          email: { message: 'Email is required' },
          password: { message: 'Password is required' },
        },
        isValid: false,
      },
    });

    renderLoginForm();

    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('uses correct translation namespace', () => {
    renderLoginForm();
    expect(useTranslations).toHaveBeenCalledWith('SignInPage');
  });

  it('applies correct CSS classes', () => {
    const { container } = renderLoginForm();

    const formElement = container.querySelector('.form-class');
    expect(formElement).toBeInTheDocument();
  });

  it('initializes form with zod resolver', () => {
    renderLoginForm();

    expect(useForm).toHaveBeenCalledWith({
      defaultValues: {
        email: '',
        password: '',
      },
      mode: 'onChange',
      resolver: expect.any(Function),
    });

    expect(zodResolver).toHaveBeenCalledWith(mockUseLoginSchema);
  });
});
