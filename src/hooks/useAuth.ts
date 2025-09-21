'use client';

import { useEffect } from 'react';
import { getAuth, onIdTokenChanged } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { setUser, removeUser } from '@/slices/userSlice';
import { app } from '@/lib/firebase/firebase';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();

        await fetch('/api/setToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        dispatch(
          setUser({
            name: user.displayName || '',
            email: user.email || '',
            id: user.uid,
            token,
            refreshToken: user.refreshToken,
          })
        );
      } else {
        dispatch(removeUser());
      }
    });

    return () => {
      unsubscribe();
    };
  }, [auth, dispatch]);
};
