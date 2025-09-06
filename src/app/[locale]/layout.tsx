import '../globals.css';
import '@ant-design/v5-patch-for-react-19';
import React from 'react';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { routing } from '../../i18n/routing';
import StoreProvider from './StoreProvider';
import AppLayout from '@/components/AppLayout/AppLayout';

export const metadata: Metadata = {
  title: 'Rest SPB',
  description: 'The only competitive application similar to Postman',
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <StoreProvider>
      <NextIntlClientProvider messages={messages}>
        <AntdRegistry>
          <AppLayout>{children}</AppLayout>
        </AntdRegistry>
      </NextIntlClientProvider>
    </StoreProvider>
  );
}
