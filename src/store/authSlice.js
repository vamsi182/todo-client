import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { errorMessage } from "../api";

const authRequest = (name, url) =>
  createAsyncThunk(`auth/${name}`, async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post(url, body);
      return data;
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  });

export const signup = authRequest("signup", "/auth/signup");
export const login = authRequest("login", "/auth/login");

export const fetchMe = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
  try {
    return (await api.get("/auth/me")).data;
  } catch (e) {
    return rejectWithValue(errorMessage(e));
  }
});

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
  checked: !localStorage.getItem("token"), // true once a saved token has been verified
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem("token");
      state.user = null;
      state.token = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (b) => {
    [signup, login].forEach((thunk) =>
      b
        .addCase(thunk.pending, (s) => {
          s.loading = true;
          s.error = null;
        })
        .addCase(thunk.fulfilled, (s, { payload }) => {
          s.loading = false;
          s.user = payload.user;
          s.token = payload.token;
          s.checked = true;
          localStorage.setItem("token", payload.token);
        })
        .addCase(thunk.rejected, (s, { payload }) => {
          s.loading = false;
          s.error = payload;
        })
    );
    b.addCase(fetchMe.fulfilled, (s, { payload }) => {
      s.user = payload.user;
      s.checked = true;
    }).addCase(fetchMe.rejected, (s) => {
      localStorage.removeItem("token");
      s.token = null;
      s.checked = true;
    });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;