import userSlice, {
  setUser,
  removeUser,
  setUserToken,
  selectUserName,
} from '@/slices/userSlice';
import User from '@/models/User';
import type { UserState } from '@/slices/userSlice';
import { describe, it, expect } from 'vitest';

describe('userSlice', () => {
  const initialState: UserState = {
    name: null,
    email: null,
    token: null,
    refreshToken: null,
    id: null,
  };

  const mockUser: User = {
    name: 'Test User',
    email: 'test@example.com',
    token: 'test-token',
    refreshToken: 'test-refresh-token',
    id: 'test-id',
  };

  describe('reducers', () => {
    it('should return initial state', () => {
      expect(userSlice(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setUser action', () => {
      const action = setUser(mockUser);
      const state = userSlice(initialState, action);

      expect(state).toEqual({
        name: 'Test User',
        email: 'test@example.com',
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        id: 'test-id',
      });
    });

    it('should handle removeUser action', () => {
      const stateWithUser = { ...mockUser };
      const action = removeUser();
      const state = userSlice(stateWithUser, action);

      expect(state).toEqual(initialState);
    });

    it('should handle setUserToken action', () => {
      const action = setUserToken('new-token');
      const state = userSlice(initialState, action);

      expect(state).toEqual({
        ...initialState,
        token: 'new-token',
      });
    });

    it('should handle setUserToken when state has existing user data', () => {
      const stateWithUser = { ...mockUser };
      const action = setUserToken('updated-token');
      const state = userSlice(stateWithUser, action);

      expect(state).toEqual({
        ...mockUser,
        token: 'updated-token',
      });
    });
  });

  describe('selectors', () => {
    it('should select user name from state', () => {
      const stateWithUser = { user: { ...mockUser } };
      const result = selectUserName(stateWithUser);

      expect(result).toBe('Test User');
    });

    it('should return null when user name is not set', () => {
      const state = { user: initialState };
      const result = selectUserName(state);

      expect(result).toBeNull();
    });
  });

  describe('action creators', () => {
    it('should create setUser action with correct payload', () => {
      const action = setUser(mockUser);

      expect(action).toEqual({
        type: 'user/setUser',
        payload: mockUser,
      });
    });

    it('should create removeUser action', () => {
      const action = removeUser();

      expect(action).toEqual({
        type: 'user/removeUser',
      });
    });

    it('should create setUserToken action with correct payload', () => {
      const action = setUserToken('test-token');

      expect(action).toEqual({
        type: 'user/setUserToken',
        payload: 'test-token',
      });
    });
  });
});
