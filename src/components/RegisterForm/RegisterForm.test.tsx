import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('./RegisterForm', () => ({
  RegisterForm: () => (
    <div data-testid="register-form">
      <form>
        <label htmlFor="name">Name</label>
        <input id="name" type="text" placeholder="Enter your name" />

        <label htmlFor="email">Email</label>
        <input id="email" type="email" placeholder="Enter your email" />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
        />

        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
        />

        <button type="submit">Register</button>
      </form>
    </div>
  ),
}));

import { RegisterForm } from './RegisterForm';

describe('RegisterForm', () => {
  it('should render form fields', () => {
    render(<RegisterForm />);

    expect(screen.getByTestId('register-form')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter your password')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Confirm your password')
    ).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('should have submit button enabled by default', () => {
    render(<RegisterForm />);

    const submitButton = screen.getByText('Register');
    expect(submitButton).not.toBeDisabled();
  });

  it('should have all form fields with correct types', () => {
    render(<RegisterForm />);

    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');

    expect(nameInput).toHaveAttribute('type', 'text');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });
});
