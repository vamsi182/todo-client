import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://todo-server-dr3j.onrender.com",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errorMessage = (err) =>
  err.response?.data?.message || "Could not reach the server. Try again";

export default api;