import { z } from 'zod';
import { useTranslations } from 'next-intl';

export const useLoginSchema = () => {
  const t = useTranslations('SignInPage');

  return z.object({
    email: z.string().min(1, { message: t('emptyEmailError') }),
    password: z.string().min(1, { message: t('emptyPasswordError') }),
  });
};
