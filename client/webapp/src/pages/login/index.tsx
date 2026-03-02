import React from "react";

import { useAuth } from "../../auth/AuthContext";

export function LoginPage() {
  const { login, token, socketStatus, logout } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await login({ email, password });
      if (!res.ok) {
        setError(res.error ?? "login failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "48px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Login</h1>
      <p style={{ opacity: 0.8 }}>Token: {token ? "present" : "none"}</p>
      <p style={{ opacity: 0.8 }}>WebSocket: {socketStatus}</p>

      {token ? (
        <button type="button" onClick={logout}>
          Logout
        </button>
      ) : null}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} />
        </label>
        <label>
          Password
          <input
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%" }}
          />
        </label>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

      <nav style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <a href="/register">Register</a>
        <a href="/forgot-password">Forgot password</a>
      </nav>
    </div>
  );
}
