'use client';

import { useEffect } from 'react';
import { getAuth, onIdTokenChanged } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { setUser, removeUser, setUserToken } from '@/slices/userSlice';
import { app } from '@/lib/firebase/firebase';
import { loadVariablesFromStorage } from '@/utils/variablesUtils';

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

        const variables = loadVariablesFromStorage();
        console.log('Variables loaded after authentication:', variables);
      } else {
        dispatch(removeUser());
      }
    });

    const interval = setInterval(
      async () => {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken(true);

          dispatch(setUserToken(token));

          await fetch('/api/setToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });

          const variables = loadVariablesFromStorage();
          console.log('Variables reloaded after token refresh:', variables);
        }
      },
      50 * 60 * 1000
    );

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [auth, dispatch]);
};
