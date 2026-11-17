import React, { useState } from "react";
import { useApp, DatasetItem, UserItem } from "../context/AppContext";

type AdminTab = "overview" | "datasets" | "models" | "users" | "reports" | "config";

const tabs: { id: AdminTab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "datasets", label: "Dataset Management", icon: "📁" },
  { id: "models", label: "Model Management", icon: "🧠" },
  { id: "users", label: "User Management", icon: "👥" },
  { id: "reports", label: "Report Management", icon: "📜" },
  { id: "config", label: "System Config", icon: "⚙️" },
];

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border ${className}`} style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      {children}
    </div>
  );
}

function OverviewTab() {
  const { transactions, networkRecords, datasets, users, models, fraudMetrics, anomalyMetrics } = useApp();

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Models", value: String(models.length), sub: "Random Forest + Isolation Forest" },
          { label: "Datasets Registered", value: String(datasets.length), sub: "Train, Test & Live Samples" },
          { label: "Active Accounts", value: String(users.filter((u) => u.status === "Active").length), sub: `${users.length} total registered` },
          { label: "Live Predictions", value: (transactions.length + networkRecords.length).toLocaleString(), sub: "In memory session" },
        ].map(({ label, value, sub }) => (
          <Card key={label} className="p-4.5">
            <p className="text-[10px] uppercase tracking-widest font-mono mb-2" style={{ color: "var(--muted-foreground)" }}>{label}</p>
            <p className="font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>{value}</p>
            <p className="text-[11px] mt-1" style={{ color: "var(--muted-foreground)" }}>{sub}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="px-5 py-3.5 border-b" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Dual Model Operational Telemetry</p>
        </div>
        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold mb-3 flex items-center gap-1.5" style={{ color: "var(--foreground)" }}>
              <span>💳</span> Fraud Detection (Random Forest)
            </p>
            {[
              { m: "Accuracy", v: fraudMetrics.accuracy, c: "#10b981" },
              { m: "Precision", v: fraudMetrics.precision, c: "#0ea5e9" },
              { m: "Recall", v: fraudMetrics.recall, c: "#f59e0b" },
              { m: "F1-Score", v: fraudMetrics.f1, c: "#a78bfa" },
            ].map(({ m, v, c }) => (
              <div key={m} className="flex items-center gap-3 mb-2.5">
                <span className="text-[11px] font-mono w-20" style={{ color: "var(--muted-foreground)" }}>{m}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--secondary)" }}>
                  <div className="h-full rounded-full" style={{ width: `${v}%`, background: c }} />
                </div>
                <span className="text-[11px] font-mono font-semibold w-12 text-right" style={{ color: c }}>{v}%</span>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs font-semibold mb-3 flex items-center gap-1.5" style={{ color: "var(--foreground)" }}>
              <span>🌐</span> Network Anomaly (Isolation Forest)
            </p>
            <div className="px-3.5 py-3 rounded-lg text-xs leading-relaxed" style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)", color: "var(--muted-foreground)" }}>
              Unsupervised anomaly detection isolates unusual observations without requiring prior manual labeling. Metrics reflect subspace isolation depth.
            </div>
            <div className="mt-3 flex flex-col gap-1">
              {[
                { label: "Contamination Factor", value: `${(anomalyMetrics.contamination * 100).toFixed(0)}%` },
                { label: "Baseline Records Trained", value: anomalyMetrics.totalRecords.toLocaleString() },
                { label: "Anomalies Partitioned", value: anomalyMetrics.anomalyCount.toLocaleString() },
                { label: "Isolation Estimators", value: String(anomalyMetrics.nEstimators) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-1.5 border-b text-xs last:border-0" style={{ borderColor: "var(--border)" }}>
                  <span style={{ color: "var(--muted-foreground)" }}>{label}</span>
                  <span className="font-mono font-semibold" style={{ color: "var(--foreground)" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function DatasetsTab() {
  const { datasets, addDataset, removeDataset } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"Credit Card Transactions" | "Network Activity">("Credit Card Transactions");
  const [records, setRecords] = useState(50000);
  const [size, setSize] = useState("12.4 MB");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addDataset({ name, type, records, size });
    setShowModal(false);
    setName("");
  };

  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Registered Datasets</p>
          <p className="text-[11px] text-muted-foreground">Catalog of training, validation, and live evaluation sets</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          + Register Dataset
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--secondary)" }}>
              {["Dataset ID", "Filename", "Dataset Type", "Records", "File Size", "Upload Date", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-mono uppercase tracking-wider text-[10px]" style={{ color: "var(--muted-foreground)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datasets.map((d, i) => (
              <tr key={d.id} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "rgba(148,163,184,0.02)" }}>
                <td className="px-4 py-3 font-mono" style={{ color: "var(--muted-foreground)" }}>{d.id}</td>
                <td className="px-4 py-3 font-mono font-medium" style={{ color: "var(--foreground)" }}>{d.name}</td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{
                    background: d.type === "Credit Card Transactions" ? "rgba(245,158,11,0.1)" : "rgba(14,165,233,0.1)",
                    color: d.type === "Credit Card Transactions" ? "var(--primary)" : "#0ea5e9",
                  }}>
                    {d.type}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono font-medium" style={{ color: "var(--foreground)" }}>{d.records.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono" style={{ color: "var(--muted-foreground)" }}>{d.size}</td>
                <td className="px-4 py-3 font-mono" style={{ color: "var(--muted-foreground)" }}>{d.uploaded}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => removeDataset(d.id)}
                    className="text-[10px] font-mono px-2.5 py-1 rounded transition-colors cursor-pointer"
                    style={{ color: "#f43f5e", background: "rgba(244,63,94,0.1)" }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={handleRegister} className="rounded-xl p-6 w-full max-w-md border flex flex-col gap-4 shadow-xl" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div>
              <p className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Register New Dataset Metadata</p>
              <p className="text-xs text-muted-foreground mt-0.5">Records are logged into MySQL datasets catalog</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase text-muted-foreground">Filename</label>
              <input
                type="text"
                placeholder="e.g. creditcard_2026.csv"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm font-mono outline-none"
                style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase text-muted-foreground">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="px-3 py-2 rounded-lg text-sm font-mono outline-none"
                style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              >
                <option value="Credit Card Transactions">Credit Card Transactions</option>
                <option value="Network Activity">Network Activity</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase text-muted-foreground">Total Rows</label>
                <input
                  type="number"
                  value={records}
                  onChange={(e) => setRecords(parseInt(e.target.value) || 0)}
                  className="px-3 py-2 rounded-lg text-sm font-mono outline-none"
                  style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase text-muted-foreground">Approx Size</label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="px-3 py-2 rounded-lg text-sm font-mono outline-none"
                  style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-2 rounded-lg text-xs font-mono cursor-pointer"
                style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-mono font-medium cursor-pointer"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                Confirm Registration
              </button>
            </div>
          </form>
        </div>
      )}
    </Card>
  );
}

function ModelsTab() {
  const { models, retrainModel } = useApp();
  const [trainingType, setTrainingType] = useState<string | null>(null);

  const handleRetrain = async (type: "fraud" | "network") => {
    setTrainingType(type);
    await retrainModel(type);
    setTrainingType(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {models.map((m) => (
        <Card key={m.type} className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-semibold text-base" style={{ color: "var(--foreground)" }}>{m.name}</p>
              <p className="text-xs mt-0.5 font-mono" style={{ color: "var(--muted-foreground)" }}>Target artifact: models/{m.file}</p>
            </div>
            <span className="px-2.5 py-1 rounded text-[11px] font-mono font-semibold" style={{
              background: m.status === "Training" ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)",
              color: m.status === "Training" ? "var(--primary)" : "#10b981",
              border: `1px solid ${m.status === "Training" ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)"}`,
            }}>
              {m.status === "Training" ? "Retraining in progress…" : m.status === "Updated" ? "Model Updated ✓" : m.status}
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 p-3.5 rounded-lg" style={{ background: "var(--secondary)" }}>
            {[
              { l: "Algorithm", v: m.algorithm },
              { l: "Version", v: m.version },
              { l: "Last Trained", v: m.trained },
              { l: "Estimators", v: `${m.nEstimators} Decision Trees` },
            ].map(({ l, v }) => (
              <div key={l}>
                <p className="text-[10px] font-mono uppercase text-muted-foreground">{l}</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: "var(--foreground)" }}>{v}</p>
              </div>
            ))}
          </div>

          {/* Model Logs */}
          <div className="mb-4">
            <p className="text-[11px] font-mono uppercase tracking-wider mb-1.5 text-muted-foreground">Execution & Training Log:</p>
            <div className="p-3 rounded-lg text-xs font-mono max-h-28 overflow-y-auto flex flex-col gap-1 border" style={{ background: "var(--background)", borderColor: "var(--border)" }}>
              {m.logs.map((log, idx) => (
                <p key={idx} className="opacity-80 leading-tight">
                  <span className="text-emerald-500 mr-1">›</span> {log}
                </p>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleRetrain(m.type)}
              disabled={trainingType === m.type}
              className="px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-opacity cursor-pointer flex items-center gap-2"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)", opacity: trainingType === m.type ? 0.6 : 1 }}
            >
              {trainingType === m.type ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--primary-foreground)", borderTopColor: "transparent" }} />
                  Fitting Decision Trees…
                </>
              ) : (
                <>↺ Re-train {m.type === "fraud" ? "Random Forest" : "Isolation Forest"}</>
              )}
            </button>
            <p className="text-[10px] text-muted-foreground font-mono">
              Executes python ml/train_{m.type}_model.py pipeline
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}

function UsersTab() {
  const { users, addUser, toggleUserStatus, deleteUser } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<"Admin" | "User">("User");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    addUser({ username, role });
    setShowModal(false);
    setUsername("");
  };

  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>User & Role Management</p>
          <p className="text-[11px] text-muted-foreground">Manage administrative and security analyst accounts</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          + Add User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--secondary)" }}>
              {["User ID", "Username", "Role", "Status", "Last Login", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-mono uppercase tracking-wider text-[10px]" style={{ color: "var(--muted-foreground)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "rgba(148,163,184,0.02)" }}>
                <td className="px-4 py-3 font-mono" style={{ color: "var(--muted-foreground)" }}>{u.id}</td>
                <td className="px-4 py-3 font-mono font-medium" style={{ color: "var(--foreground)" }}>{u.username}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold" style={{
                    background: u.role === "Admin" ? "rgba(245,158,11,0.12)" : "rgba(14,165,233,0.12)",
                    color: u.role === "Admin" ? "#f59e0b" : "#0ea5e9",
                  }}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold" style={{
                    background: u.status === "Active" ? "rgba(16,185,129,0.12)" : "rgba(148,163,184,0.12)",
                    color: u.status === "Active" ? "#10b981" : "#64748b",
                  }}>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono" style={{ color: "var(--muted-foreground)" }}>{u.lastLogin}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => toggleUserStatus(u.id)}
                    className="text-[10px] font-mono px-2.5 py-1 rounded transition-colors cursor-pointer"
                    style={{ color: "var(--primary)", background: "rgba(245,158,11,0.1)" }}
                  >
                    {u.status === "Active" ? "Deactivate" : "Activate"}
                  </button>
                  {u.role !== "Admin" && (
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="text-[10px] font-mono px-2.5 py-1 rounded transition-colors cursor-pointer"
                      style={{ color: "#f43f5e", background: "rgba(244,63,94,0.1)" }}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={handleAdd} className="rounded-xl p-6 w-full max-w-sm border flex flex-col gap-4 shadow-xl" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div>
              <p className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Add New System User</p>
              <p className="text-xs text-muted-foreground mt-0.5">Password will be initialized with default bcrypt hash</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase text-muted-foreground">Username</label>
              <input
                type="text"
                placeholder="e.g. analyst_03"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm font-mono outline-none"
                style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase text-muted-foreground">Assigned Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="px-3 py-2 rounded-lg text-sm font-mono outline-none"
                style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              >
                <option value="User">User (Analyst)</option>
                <option value="Admin">Admin (Full Control)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-2 rounded-lg text-xs font-mono cursor-pointer"
                style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-mono font-medium cursor-pointer"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}
    </Card>
  );
}

function ReportManagementTab() {
  const { reportAudits } = useApp();

  const downloadAuditTrailCSV = () => {
    const rows = [
      ["Report ID", "Report Title", "Type", "Timestamp", "Total Records", "Flagged Records", "Detection Rate"].join(","),
      ...reportAudits.map((a) => [a.id, a.title, a.type, a.generatedAt, a.totalRecords, a.flaggedCount, a.rate].join(",")),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Report Management & Audit Trail</p>
          <p className="text-[11px] text-muted-foreground">Historical batch analyses and SIEM incident exports</p>
        </div>
        <button
          onClick={downloadAuditTrailCSV}
          className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5"
          style={{ background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)" }}
        >
          <span>↓</span> Export Audit Trail CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--secondary)" }}>
              {["Report ID", "Title", "Detection Module", "Timestamp", "Records Evaluated", "Anomalies/Fraud", "Ratio"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-mono uppercase tracking-wider text-[10px]" style={{ color: "var(--muted-foreground)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportAudits.map((a, i) => (
              <tr key={a.id} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "rgba(148,163,184,0.02)" }}>
                <td className="px-4 py-3 font-mono" style={{ color: "var(--muted-foreground)" }}>{a.id}</td>
                <td className="px-4 py-3 font-medium" style={{ color: "var(--foreground)" }}>{a.title}</td>
                <td className="px-4 py-3 font-mono">
                  <span className="px-2 py-0.5 rounded text-[10px]" style={{
                    background: a.type === "Fraud Detection" ? "rgba(16,185,129,0.1)" : "rgba(14,165,233,0.1)",
                    color: a.type === "Fraud Detection" ? "#10b981" : "#0ea5e9",
                  }}>
                    {a.type}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono" style={{ color: "var(--muted-foreground)" }}>{a.generatedAt}</td>
                <td className="px-4 py-3 font-mono font-medium" style={{ color: "var(--foreground)" }}>{a.totalRecords.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono font-semibold" style={{ color: "#f43f5e" }}>{a.flaggedCount}</td>
                <td className="px-4 py-3 font-mono font-semibold" style={{ color: "var(--primary)" }}>{a.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ConfigTab() {
  const { config, updateConfig } = useApp();
  const [localConfig, setLocalConfig] = useState(config);
  const [saved, setSaved] = useState(false);

  const save = () => {
    updateConfig(localConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Card className="p-6 max-w-xl">
      <div className="mb-5">
        <p className="text-base font-semibold" style={{ color: "var(--foreground)" }}>System Configuration Parameters</p>
        <p className="text-xs text-muted-foreground mt-0.5">Parameters are applied across all active inference pipelines immediately</p>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <label className="text-[11px] font-mono uppercase tracking-wider block mb-1.5 text-muted-foreground">
            Fraud Decision Probability Threshold ({localConfig.fraudThreshold})
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range" min={0.3} max={0.9} step={0.05}
              value={localConfig.fraudThreshold}
              onChange={(e) => setLocalConfig((c) => ({ ...c, fraudThreshold: parseFloat(e.target.value) }))}
              className="flex-1"
            />
            <span className="font-mono text-sm w-12 text-right font-bold" style={{ color: "var(--primary)" }}>{localConfig.fraudThreshold}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Lowering threshold increases sensitivity/recall; raising threshold minimizes false positives.</span>
        </div>

        <div>
          <label className="text-[11px] font-mono uppercase tracking-wider block mb-1.5 text-muted-foreground">
            Isolation Forest Contamination ({localConfig.anomalyContamination})
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range" min={0.01} max={0.2} step={0.01}
              value={localConfig.anomalyContamination}
              onChange={(e) => setLocalConfig((c) => ({ ...c, anomalyContamination: parseFloat(e.target.value) }))}
              className="flex-1"
            />
            <span className="font-mono text-sm w-12 text-right font-bold" style={{ color: "#0ea5e9" }}>{localConfig.anomalyContamination}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Expected proportion of outliers in the network observation dataset.</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider block mb-1.5 text-muted-foreground">
              Max Display Rows
            </label>
            <input
              type="number"
              value={localConfig.maxDisplayRows}
              onChange={(e) => setLocalConfig((c) => ({ ...c, maxDisplayRows: parseInt(e.target.value) || 50 }))}
              className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none"
              style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            />
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider block mb-1.5 text-muted-foreground">
              Max Upload Size (MB)
            </label>
            <input
              type="number"
              value={localConfig.maxFileSize}
              onChange={(e) => setLocalConfig((c) => ({ ...c, maxFileSize: parseInt(e.target.value) || 50 }))}
              className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none"
              style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-lg border" style={{ background: "var(--secondary)", borderColor: "var(--border)" }}>
          <div>
            <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>Real-Time Alert Banner</p>
            <p className="text-[10px] text-muted-foreground">Displays visual notification warnings upon detecting suspicious events</p>
          </div>
          <button
            type="button"
            onClick={() => setLocalConfig((c) => ({ ...c, alertEnabled: !c.alertEnabled }))}
            className="w-11 h-6 rounded-full transition-colors relative cursor-pointer"
            style={{ background: localConfig.alertEnabled ? "var(--primary)" : "var(--muted)" }}
          >
            <span
              className="absolute top-1 w-4 h-4 rounded-full transition-all bg-white"
              style={{ left: localConfig.alertEnabled ? "calc(100% - 20px)" : "4px" }}
            />
          </button>
        </div>

        <button
          onClick={save}
          className="py-2.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer mt-1"
          style={{ background: saved ? "#10b981" : "var(--primary)", color: saved ? "white" : "var(--primary-foreground)" }}
        >
          {saved ? "✓ Configuration Persisted to System State" : "Save Configuration"}
        </button>
      </div>
    </Card>
  );
}

type Props = { onLogout: () => void };

export default function AdminDashboard({ onLogout }: Props) {
  const [tab, setTab] = useState<AdminTab>("overview");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b shrink-0"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div>
          <h1 className="font-display text-xl font-bold" style={{ color: "var(--foreground)" }}>Admin Console</h1>
          <p className="text-xs mt-0.5 text-muted-foreground">
            Authenticated as <span className="font-mono font-semibold" style={{ color: "var(--primary)" }}>admin</span> (Superuser)
          </p>
        </div>
        <button
          onClick={onLogout}
          className="px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer"
          style={{ background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)" }}
        >
          Sign Out ↪
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-3 pb-2 border-b shrink-0 overflow-x-auto" style={{ borderColor: "var(--border)" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-3.5 py-2 text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            style={{
              background: tab === t.id ? "var(--primary)" : "transparent",
              color: tab === t.id ? "var(--primary-foreground)" : "var(--muted-foreground)",
              fontWeight: tab === t.id ? 600 : 400,
            }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {tab === "overview" && <OverviewTab />}
        {tab === "datasets" && <DatasetsTab />}
        {tab === "models" && <ModelsTab />}
        {tab === "users" && <UsersTab />}
        {tab === "reports" && <ReportManagementTab />}
        {tab === "config" && <ConfigTab />}
      </div>
    </div>
  );
}
