import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMe } from "./store/authSlice";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";

function Protected({ children }) {
  const { user, checked } = useSelector((s) => s.auth);
  if (!checked) return <p className="boot">Loading…</p>;
  return user ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { user, checked } = useSelector((s) => s.auth);
  if (!checked) return <p className="boot">Loading…</p>;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // verify a saved token once on load
    if (localStorage.getItem("token")) dispatch(fetchMe());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/login" element={<GuestOnly><Auth mode="login" /></GuestOnly>} />
      <Route path="/signup" element={<GuestOnly><Auth mode="signup" /></GuestOnly>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}