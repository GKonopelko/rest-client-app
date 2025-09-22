import '@/app/globals.css';
import '@ant-design/v5-patch-for-react-19';
import React from 'react';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { routing } from '@/i18n/routing';
import AppLayout from '@/layouts/AppLayout/AppLayout';
import { AuthProvider } from './AuthProvider';
import StoreProvider from './StoreProvider';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const _ = await params;
  return {
    title: 'Rest SPB',
    description: 'The only competitive application similar to Postman',
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <StoreProvider>
      <AuthProvider>
        <NextIntlClientProvider
          messages={messages}
          locale={locale}
          now={new Date()}
          timeZone="UTC"
        >
          <AntdRegistry>
            <AppLayout>{children}</AppLayout>
          </AntdRegistry>
        </NextIntlClientProvider>
      </AuthProvider>
    </StoreProvider>
  );
}
