const BASE_URL =
  import.meta.env.VITE_API_URL || "https://todo-server-dr3j.onrender.com/api";

async function request(method, url, body) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers: {
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // response had no JSON body
  }

  if (!res.ok) {
    // same shape axios errors had, so errorMessage keeps working
    const error = new Error(data?.message || `Request failed (${res.status})`);
    error.response = { status: res.status, data };
    throw error;
  }

  return { data };
}

const api = {
  get: (url) => request("GET", url),
  post: (url, body) => request("POST", url, body ?? {}),
  put: (url, body) => request("PUT", url, body ?? {}),
  delete: (url) => request("DELETE", url),
};

export const errorMessage = (err) =>
  err.response?.data?.message || "Could not reach the server. Try again";

export default api;