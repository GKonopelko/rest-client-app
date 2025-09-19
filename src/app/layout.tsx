import './globals.css';
import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rest SPB',
  description: 'The only competitive application similar to Postman',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
