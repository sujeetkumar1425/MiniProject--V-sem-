import { useState } from "react";

type Props = {
  onLogin: () => void;
};

const DEMO_USER = "admin";
// Simulated bcrypt hash check — in production, this is server-side
const DEMO_PASS = "admin123";

export default function AdminLogin({ onLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }
    setLoading(true);
    setError("");
    // Simulate server-side bcrypt verification
    setTimeout(() => {
      if (username === DEMO_USER && password === DEMO_PASS) {
        onLogin();
      } else {
        setError("Invalid credentials. Try admin / admin123 for demo.");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold mx-auto mb-4"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            ⚙
          </div>
          <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--foreground)" }}>
            Admin Console
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Restricted access — authorized personnel only
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl p-6"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              className="rounded px-3 py-2.5 text-sm outline-none transition-colors"
              style={{
                background: "var(--secondary)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
              onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="rounded px-3 py-2.5 text-sm outline-none transition-colors"
              style={{
                background: "var(--secondary)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
              onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
            />
          </div>

          {error && (
            <p className="text-xs px-3 py-2 rounded" style={{ background: "rgba(244,63,94,0.1)", color: "#f43f5e", border: "1px solid rgba(244,63,94,0.2)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="py-2.5 rounded font-medium text-sm transition-opacity mt-1"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Verifying…" : "Sign In"}
          </button>
        </form>

        <div className="mt-4 p-3 rounded text-xs text-center" style={{ background: "rgba(148,163,184,0.04)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
          Demo credentials: <span className="font-mono" style={{ color: "var(--foreground)" }}>admin</span> / <span className="font-mono" style={{ color: "var(--foreground)" }}>admin123</span>
          <br />In production, passwords are stored as bcrypt hashes in MySQL.
        </div>
      </div>
    </div>
  );
}
