import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../api/endpoints';
import { TOKEN_KEY } from '../../api/axios';
import type { UserProfile } from '../../types';
import toast from 'react-hot-toast';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  loading: false,
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (data: { email: string; password: string }) => {
    const res = await authApi.login(data);
    return res.data;
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (data: { email: string; password: string; fullName: string }) => {
    const res = await authApi.register(data);
    return res.data;
  }
);

export const fetchMeThunk = createAsyncThunk('auth/me', async () => {
  const res = await authApi.me();
  return res.data;
});

export const updateMeThunk = createAsyncThunk(
  'auth/updateMe',
  async (data: { fullName: string; bio: string; profileImageUrl: string }) => {
    const res = await authApi.updateMe(data);
    return res.data;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem(TOKEN_KEY);
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      localStorage.setItem(TOKEN_KEY, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => { state.loading = true; })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        localStorage.setItem(TOKEN_KEY, action.payload.token);
        toast.success('Logged in successfully!');
      })
      .addCase(loginThunk.rejected, (state) => { state.loading = false; })
      .addCase(registerThunk.pending, (state) => { state.loading = true; })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        localStorage.setItem(TOKEN_KEY, action.payload.token);
        toast.success('Account created!');
      })
      .addCase(registerThunk.rejected, (state) => { state.loading = false; })
      .addCase(fetchMeThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateMeThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        toast.success('Profile updated!');
      });
  },
});

export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer;
