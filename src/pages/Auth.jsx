import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, signup, clearError } from "../store/authSlice";

export default function Auth({ mode }) {
  const isSignup = mode === "signup";
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    dispatch(clearError());
  }, [mode, dispatch]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    dispatch(isSignup ? signup(form) : login({ email: form.email, password: form.password }));
  };

  return (
    <main className="auth">
      <section className="auth-pitch">
        <h1 className="wordmark">Tally</h1>
        <p>One list. Mark it, strike it, done.</p>
      </section>

      <form className="auth-form" onSubmit={submit} noValidate>
        <h2>{isSignup ? "Create your account" : "Log in"}</h2>

        {isSignup && (
          <label>
            Name
            <input value={form.name} onChange={set("name")} autoComplete="name" required />
          </label>
        )}
        <label>
          Email
          <input type="email" value={form.email} onChange={set("email")} autoComplete="email" required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={set("password")}
            autoComplete={isSignup ? "new-password" : "current-password"}
            minLength={6}
            required
          />
        </label>

        {error && <p className="error" role="alert">{error}</p>}

        <button className="btn primary" disabled={loading}>
          {loading ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
        </button>

        <p className="switch">
          {isSignup ? (
            <>Already have an account? <Link to="/login">Log in</Link></>
          ) : (
            <>New here? <Link to="/signup">Create an account</Link></>
          )}
        </p>
      </form>
    </main>
  );
}