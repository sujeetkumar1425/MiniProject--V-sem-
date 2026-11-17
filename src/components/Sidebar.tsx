import { useApp } from "../context/AppContext";

type Page =
  | "dashboard"
  | "fraud"
  | "network"
  | "reports"
  | "admin-login"
  | "admin";

type Props = {
  current: Page;
  onNav: (p: Page) => void;
  isAdmin: boolean;
};

const navItems: { id: Page; label: string; icon: string; adminOnly?: boolean }[] = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "fraud", label: "Fraud Detection", icon: "💳" },
  { id: "network", label: "Network Anomaly", icon: "🌐" },
  { id: "reports", label: "Reports", icon: "📊" },
  { id: "admin-login", label: "Admin Login", icon: "🔐" },
  { id: "admin", label: "Admin Console", icon: "⚙️", adminOnly: true },
];

export default function Sidebar({ current, onNav, isAdmin }: Props) {
  const { theme, toggleTheme, config } = useApp();

  return (
    <aside
      className="flex flex-col w-60 shrink-0 border-r select-none transition-colors"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      {/* Brand & Logo */}
      <div className="px-5 pt-6 pb-5 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            FG
          </div>
          <div>
            <p className="font-display text-base font-semibold leading-tight" style={{ color: "var(--foreground)" }}>
              FraudGuard
            </p>
            <p className="text-[10px] font-mono tracking-tight" style={{ color: "var(--muted-foreground)" }}>
              Dual ML Detection System
            </p>
          </div>
        </div>
      </div>

      {/* Model & System Status */}
      <div className="mx-3 mt-4 mb-2 p-2.5 rounded-lg flex flex-col gap-1.5" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--safe)" }} />
            <span className="text-[10px] font-mono font-semibold" style={{ color: "var(--safe)" }}>
              MODELS ACTIVE
            </span>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(16,185,129,0.15)", color: "var(--safe)" }}>
            2 LOADED
          </span>
        </div>
        <p className="text-[9px] font-mono" style={{ color: "var(--muted-foreground)" }}>
          Threshold: {config.fraudThreshold} · Contam: {config.anomalyContamination}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-2 flex flex-col gap-1">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => {
            const active = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNav(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 cursor-pointer"
                style={{
                  background: active ? "rgba(245,158,11,0.12)" : "transparent",
                  color: active ? "var(--primary)" : "var(--foreground)",
                  borderLeft: active ? "3px solid var(--primary)" : "3px solid transparent",
                  fontWeight: active ? 600 : 400,
                }}
              >
                <span className="text-base leading-none opacity-80">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
                {item.id === "admin" && (
                  <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.2)", color: "var(--primary)" }}>
                    Admin
                  </span>
                )}
              </button>
            );
          })}
      </nav>

      {/* Theme Toggle & Academic Footer */}
      <div className="px-4 py-4 border-t flex flex-col gap-3" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-mono transition-colors cursor-pointer"
          style={{ background: "var(--secondary)", color: "var(--secondary-foreground)", border: "1px solid var(--border)" }}
        >
          <span className="flex items-center gap-2">
            <span>{theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}</span>
          </span>
          <span className="text-[10px] opacity-60">Toggle</span>
        </button>

        <div className="text-[10px] font-mono leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          <p className="font-semibold" style={{ color: "var(--foreground)" }}>College Mini Project</p>
          <p className="opacity-80">Random Forest + Isolation Forest</p>
          <p className="text-[9px] mt-0.5 opacity-60">MySQL & Scikit-learn Ready</p>
        </div>
      </div>
    </aside>
  );
}
