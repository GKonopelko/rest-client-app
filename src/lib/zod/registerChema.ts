import { z } from 'zod';

const nameRegex = /^[A-Z][a-zA-Z]*$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/;

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .regex(
        nameRegex,
        'Name must start with a capital letter. The name must contain only Latin letters without spaces.'
      ),
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
