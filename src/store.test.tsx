import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import {
  initStore,
  type AppStore,
  type RootState,
  type AppDispatch,
} from './store';
import userReducer from './slices/userSlice';

describe('Store', () => {
  let store: AppStore;

  beforeEach(() => {
    store = initStore();
  });

  it('should initialize with correct reducers', () => {
    const state = store.getState();
    expect(state).toHaveProperty('user');
    expect(state.user).toEqual(userReducer(undefined, { type: '@@INIT' }));
  });

  it('should have correct types', () => {
    const state: RootState = store.getState();

    expect(state.user).toEqual({
      name: null,
      email: null,
      token: null,
      refreshToken: null,
      id: null,
    });

    expect(typeof store.dispatch).toBe('function');

    expect(store).toHaveProperty('getState');
    expect(store).toHaveProperty('dispatch');
    expect(store).toHaveProperty('subscribe');
    expect(store).toHaveProperty('replaceReducer');
  });

  it('should handle preloaded state', () => {
    const preloadedState = {
      user: {
        name: 'Test User',
        email: 'test@example.com',
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        id: 'test-id',
      },
    };

    const customStore = configureStore({
      reducer: {
        user: userReducer,
      },
      preloadedState,
    });

    const state = customStore.getState();
    expect(state.user).toEqual(preloadedState.user);
  });

  it('should export correct types', () => {
    const testStore: AppStore = store;
    const testDispatch: AppDispatch = store.dispatch;
    const testState: RootState = store.getState();

    expect(testStore).toBeDefined();
    expect(testDispatch).toBeDefined();
    expect(testState).toBeDefined();
  });
});
