import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import userReducer from './slices/userSlice';

export const initStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });
};

export type AppStore = ReturnType<typeof initStore>;
export type AppDispatch = AppStore['dispatch'];
export type RootState = ReturnType<AppStore['getState']>;
