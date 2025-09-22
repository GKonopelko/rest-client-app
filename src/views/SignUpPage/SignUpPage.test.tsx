import { render, screen } from '@testing-library/react';
import { useTranslations } from 'next-intl';
import SignUpPage from './SignUpPage';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

vi.mock('@/components/RegisterForm/RegisterForm', () => ({
  RegisterForm: () => <div data-testid="register-form">RegisterForm</div>,
}));

vi.mock('./SignUpPage.module.css', () => ({
  default: {
    page: 'page-class',
    content: 'content-class',
  },
}));

describe('SignUpPage Component', () => {
  let mockTFunction: Mock;

  beforeEach(() => {
    mockTFunction = vi.fn();
    (useTranslations as Mock).mockReturnValue(mockTFunction);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderSignUpPage = () => {
    return render(<SignUpPage />);
  };

  it('renders page title from translations', () => {
    mockTFunction.mockImplementation((key: string) => {
      if (key === 'title') return 'Create Account';
      return key;
    });

    renderSignUpPage();

    expect(screen.getByText('Create Account')).toBeInTheDocument();

    expect(useTranslations).toHaveBeenCalledWith('SignUpPage');

    expect(mockTFunction).toHaveBeenCalledWith('title');
  });

  it('renders RegisterForm component', () => {
    mockTFunction.mockImplementation((key: string) => key);

    renderSignUpPage();

    expect(screen.getByTestId('register-form')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    mockTFunction.mockImplementation((key: string) => key);

    const { container } = renderSignUpPage();

    const pageElement = container.querySelector('.page-class');
    const contentElement = container.querySelector('.content-class');

    expect(pageElement).toBeInTheDocument();
    expect(contentElement).toBeInTheDocument();
  });

  it('uses correct translation namespace', () => {
    mockTFunction.mockImplementation((key: string) => key);

    renderSignUpPage();

    expect(useTranslations).toHaveBeenCalledWith('SignUpPage');
  });
});
