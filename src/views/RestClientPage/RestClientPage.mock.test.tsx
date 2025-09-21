import { render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import userSlice from '@/slices/userSlice';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('./RestClientPage', () => ({
  default: () => <div>RestClientPage Mock</div>,
}));

import RestClientPage from './RestClientPage';

describe('RestClientPage Mock Test', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        user: userSlice,
      },
    });
  });

  it('should use mock', () => {
    render(
      <Provider store={store}>
        <RestClientPage />
      </Provider>
    );

    expect(screen.getByText('RestClientPage Mock')).toBeInTheDocument();
  });
});
