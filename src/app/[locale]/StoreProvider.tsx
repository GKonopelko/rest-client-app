'use client';

import React, { useMemo } from 'react';
import { Provider } from 'react-redux';
import { AppStore, initStore } from '../../store';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = useMemo<AppStore>(() => initStore(), []);
  return <Provider store={store}>{children}</Provider>;
}
