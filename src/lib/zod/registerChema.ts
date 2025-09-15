import { z } from 'zod';
import { useTranslations } from 'next-intl';

const nameRegex = /^[A-Z][a-zA-Z]*$/;
const passwordRegex = /^(?=.*\p{L})(?=.*\d)(?=.*[^\p{L}\d\s]).+$/u;

export const useRegisterSchema = () => {
  const t = useTranslations('SignUpPage');

  return z
    .object({
      name: z
        .string()
        .min(1, { message: t('nameRequired') })
        .regex(nameRegex, { message: t('nameInvalid') }),
      email: z
        .string()
        .min(1, { message: t('emailRequired') })
        .regex(/^\S+$/, { message: t('emailNoSpaces') })
        .regex(/(?=.*@)/, { message: t('emailMissingAt') })
        .regex(/^[^@]+@[^@]+\.[^@]+$/, { message: t('emailInvalidDomain') }),
      password: z
        .string()
        .min(8, { message: t('passwordMin') })
        .regex(passwordRegex, { message: t('passwordWeak') }),
      confirmPassword: z
        .string()
        .min(8, { message: t('passwordMin') })
        .regex(passwordRegex, { message: t('passwordWeak') }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('passwordsMismatch'),
      path: ['confirmPassword'],
    });
};
