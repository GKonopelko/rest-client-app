import { useDispatch } from 'react-redux';
import { getAuth, onIdTokenChanged } from 'firebase/auth';
import { app } from '@/lib/firebase/firebase';
import { useAuth } from './useAuth';
import { setUser, removeUser } from '@/slices/userSlice';
import { renderHook } from '@testing-library/react';
import { vi, describe, Mock, beforeEach, afterEach, it, expect } from 'vitest';

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onIdTokenChanged: vi.fn(),
}));

vi.mock('@/lib/firebase/firebase', () => ({
  app: {},
}));

vi.mock('@/slices/userSlice', () => ({
  setUser: vi.fn(),
  removeUser: vi.fn(),
  setUserToken: vi.fn(),
}));

describe('useAuth', () => {
  let mockDispatch: Mock;
  let mockAuth: { currentUser: unknown };
  let mockUnsubscribe: Mock;

  beforeEach(() => {
    mockDispatch = vi.fn();
    mockUnsubscribe = vi.fn();
    mockAuth = { currentUser: null };

    (useDispatch as unknown as Mock).mockReturnValue(mockDispatch);
    (getAuth as Mock).mockReturnValue(mockAuth);
    (onIdTokenChanged as Mock).mockReturnValue(mockUnsubscribe);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should set up auth listener and token refresh interval', () => {
    const { unmount } = renderHook(() => useAuth());

    expect(getAuth).toHaveBeenCalledWith(app);
    expect(onIdTokenChanged).toHaveBeenCalledWith(
      mockAuth,
      expect.any(Function)
    );

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should handle user authentication with token', async () => {
    const mockUser = {
      displayName: 'Test User',
      email: 'test@example.com',
      uid: 'test-uid',
      refreshToken: 'test-refresh-token',
      getIdToken: vi.fn().mockResolvedValue('test-token'),
    };

    renderHook(() => useAuth());

    const authCallback = (onIdTokenChanged as Mock).mock.calls[0][1];
    await authCallback(mockUser);

    expect(mockUser.getIdToken).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith('/api/setToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'test-token' }),
    });
    expect(mockDispatch).toHaveBeenCalledWith(
      setUser({
        name: 'Test User',
        email: 'test@example.com',
        id: 'test-uid',
        token: 'test-token',
        refreshToken: 'test-refresh-token',
      })
    );
  });

  it('should handle user removal when no user', () => {
    renderHook(() => useAuth());

    const authCallback = (onIdTokenChanged as Mock).mock.calls[0][1];
    authCallback(null);

    expect(mockDispatch).toHaveBeenCalledWith(removeUser());
  });
});
