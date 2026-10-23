import { configureStore } from "@reduxjs/toolkit";
import auth from "./authSlice";
import todos from "./todosSlice";

export default configureStore({ reducer: { auth, todos } });