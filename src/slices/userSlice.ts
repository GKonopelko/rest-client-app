import User from '@/models/User';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type UserState = {
  name: string | null;
  email: string | null;
  token: string | null;
  refreshToken: string | null;
  id: string | null;
};

const initialState: UserState = {
  name: null,
  email: null,
  token: null,
  refreshToken: null,
  id: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  selectors: {
    selectUserName: (state) => state.name,
    selectUserId: (state) => state.id,
  },
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.id = action.payload.id;
    },
    removeUser(state) {
      state.name = null;
      state.email = null;
      state.token = null;
      state.refreshToken = null;
      state.id = null;
    },
    setUserToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
  },
});

export const { selectUserName, selectUserId } = userSlice.selectors;
export const { setUser, removeUser, setUserToken } = userSlice.actions;

export default userSlice.reducer;
