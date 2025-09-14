import { z } from 'zod';

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/;

export const authSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: 'Email cannot be empty' })
      .regex(/^\S+$/, { message: 'Email must not contain spaces' })
      .regex(/(?=.*@)/, { message: 'Missing or incorrect use of the @ symbol' })
      .regex(/^[^@]+@[^@]+\.[^@]+$/, { message: 'Domain name missing' }),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        passwordRegex,
        'The password is too weak or contains non-Latin characters'
      ),
    confirmPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        passwordRegex,
        'The password is too weak or contains non-Latin characters'
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });
