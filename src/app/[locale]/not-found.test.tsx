import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AppNotFoundPage from '@/app/not-found';
import { NextIntlClientProvider } from 'next-intl';

const messages = {
  NotFoundPage: {
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist.',
  },
};

function renderWithIntl(component: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {component}
    </NextIntlClientProvider>
  );
}

describe('AppNotFoundPage', () => {
  it('renders without crashing', () => {
    renderWithIntl(<AppNotFoundPage />);
    expect(screen.getByText(/page not found/i)).toBeDefined();
  });
});
