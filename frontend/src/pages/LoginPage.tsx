import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuthStore } from "../stores/auth.store";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    try {
      await login({ email, password });
      navigate("/");
    } catch {
      setError("Invalid email or password");
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.badge}>Credit SaaS</div>
        <h1 style={styles.heroTitle}>Buy credits. Unlock features. Scale faster.</h1>
        <p style={styles.heroText}>
          Manage SaaS credit packages, wallet balance, purchase history, and
          feature access from one clean dashboard.
        </p>
      </section>

      <section style={styles.card}>
        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.subtitle}>Login to continue to your dashboard.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.field}>
            <span>Email</span>
            <input
              style={styles.input}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label style={styles.field}>
            <span>Password</span>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error && <div style={styles.error}>{error}</div>}

          <button disabled={isLoading} style={styles.button}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={styles.footerText}>
          No account? <Link to="/register">Create one</Link>
        </p>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    background: "#f3f4f6",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  hero: {
    padding: 72,
    background: "linear-gradient(135deg, #111827, #4f46e5)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  badge: {
    width: "fit-content",
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.14)",
    fontWeight: 800,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 54,
    lineHeight: 1.05,
    margin: 0,
    maxWidth: 680,
  },
  heroText: {
    fontSize: 18,
    lineHeight: 1.8,
    opacity: 0.88,
    maxWidth: 620,
    marginTop: 24,
  },
  card: {
    alignSelf: "center",
    justifySelf: "center",
    width: "min(420px, calc(100% - 48px))",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 28,
    padding: 32,
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12)",
  },
  title: { fontSize: 32, margin: 0 },
  subtitle: { color: "#6b7280", marginBottom: 24 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 8, fontWeight: 800 },
  input: {
    padding: "13px 14px",
    borderRadius: 14,
    border: "1px solid #d1d5db",
    fontSize: 15,
    outline: "none",
  },
  error: {
    padding: 12,
    borderRadius: 12,
    background: "#fef2f2",
    color: "#b91c1c",
    fontWeight: 700,
  },
  button: {
    padding: "14px 16px",
    border: "none",
    borderRadius: 14,
    background: "#111827",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 15,
  },
  footerText: { color: "#6b7280", marginTop: 20 },
};