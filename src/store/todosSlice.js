import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { errorMessage } from "../api";

const thunk = (name, fn) =>
  createAsyncThunk(`todos/${name}`, async (arg, { rejectWithValue }) => {
    try {
      return await fn(arg);
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  });

export const fetchTodos = thunk("fetch", async () => (await api.get("/todos")).data);
export const addTodo = thunk("add", async (todo) => (await api.post("/todos", todo)).data);
export const updateTodo = thunk("update", async ({ id, ...changes }) =>
  (await api.put(`/todos/${id}`, changes)).data
);
export const removeTodo = thunk("remove", async (id) => (await api.delete(`/todos/${id}`)).data.id);

const todosSlice = createSlice({
  name: "todos",
  initialState: { items: [], filter: "all", loading: false, error: null },
  reducers: {
    setFilter(state, { payload }) {
      state.filter = payload;
    },
    clearTodos(state) {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchTodos.pending, (s) => {
      s.loading = true;
      s.error = null;
    })
      .addCase(fetchTodos.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.items = payload;
      })
      .addCase(addTodo.fulfilled, (s, { payload }) => {
        s.items.unshift(payload);
        s.error = null;
      })
      .addCase(updateTodo.fulfilled, (s, { payload }) => {
        const i = s.items.findIndex((t) => t._id === payload._id);
        if (i !== -1) s.items[i] = payload;
      })
      .addCase(removeTodo.fulfilled, (s, { payload }) => {
        s.items = s.items.filter((t) => t._id !== payload);
      });
    [fetchTodos, addTodo, updateTodo, removeTodo].forEach((t) =>
      b.addCase(t.rejected, (s, { payload }) => {
        s.loading = false;
        s.error = payload;
      })
    );
  },
});

export const { setFilter, clearTodos } = todosSlice.actions;
export default todosSlice.reducer;