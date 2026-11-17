import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useApp } from "../context/AppContext";

const SAFE_COLOR = "#10b981";
const DANGER_COLOR = "#f43f5e";
const ACCENT_COLOR = "#0ea5e9";
const PRIMARY_COLOR = "#f59e0b";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div
        className="px-3 py-2 rounded text-xs font-mono shadow-lg"
        style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
      >
        <p className="mb-1 opacity-70 font-semibold">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function StatCard({
  label,
  value,
  sub,
  color,
  badge,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  badge?: string;
}) {
  return (
    <div
      className="rounded-xl p-4.5 flex flex-col justify-between transition-transform duration-150 hover:translate-y-[-1px]"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] uppercase tracking-wider font-mono font-medium" style={{ color: "var(--muted-foreground)" }}>
          {label}
        </p>
        {badge && (
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.12)", color: "var(--primary)" }}>
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="font-display text-2xl font-bold tracking-tight leading-none" style={{ color: color ?? "var(--foreground)" }}>
          {value}
        </p>
        {sub && <p className="text-[11px] mt-1.5" style={{ color: "var(--muted-foreground)" }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate }: { onNavigate?: (p: any) => void }) {
  const { transactions, networkRecords, fraudMetrics, config, fraudDatasetName, networkDatasetName } = useApp();

  const fraudCount = transactions.filter((t) => t.prediction === "Potentially Fraudulent").length;
  const legitCount = transactions.length - fraudCount;
  const fraudRate = transactions.length ? ((fraudCount / transactions.length) * 100).toFixed(2) : "0.00";

  const anomalyCount = networkRecords.filter((r) => r.status === "Suspicious Activity").length;
  const normalCount = networkRecords.length - anomalyCount;
  const anomalyRate = networkRecords.length ? ((anomalyCount / networkRecords.length) * 100).toFixed(1) : "0.0";

  const fraudPie = [
    { name: "Legitimate", value: legitCount },
    { name: "Potentially Fraudulent", value: fraudCount },
  ];

  const networkPie = [
    { name: "Normal Activity", value: normalCount },
    { name: "Suspicious Activity", value: anomalyCount },
  ];

  const amountBuckets = [
    { range: "$0–50", count: 0 },
    { range: "$50–200", count: 0 },
    { range: "$200–500", count: 0 },
    { range: "$500–1k", count: 0 },
    { range: "$1k–5k", count: 0 },
    { range: "$5k+", count: 0 },
  ];

  transactions.forEach((t) => {
    if (t.amount <= 50) amountBuckets[0].count++;
    else if (t.amount <= 200) amountBuckets[1].count++;
    else if (t.amount <= 500) amountBuckets[2].count++;
    else if (t.amount <= 1000) amountBuckets[3].count++;
    else if (t.amount <= 5000) amountBuckets[4].count++;
    else amountBuckets[5].count++;
  });

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            System Dashboard
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
            Real-time telemetry and metrics for dual ML detection pipelines
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onNavigate && (
            <>
              <button
                onClick={() => onNavigate("fraud")}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                + Scan Transactions
              </button>
              <button
                onClick={() => onNavigate("network")}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer"
                style={{ background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)" }}
              >
                + Scan Network
              </button>
            </>
          )}
        </div>
      </div>

      {/* Alert banner */}
      {config.alertEnabled && (fraudCount > 0 || anomalyCount > 0) && (
        <div
          className="flex items-start sm:items-center gap-3 px-4 py-3 rounded-xl border transition-all"
          style={{ background: "rgba(244,63,94,0.08)", borderColor: "rgba(244,63,94,0.25)" }}
        >
          <span className="text-xl">⚠️</span>
          <div className="flex-1">
            <p className="text-xs font-semibold" style={{ color: DANGER_COLOR }}>
              Active Detection Alerts: {fraudCount} flagged transactions · {anomalyCount} suspicious network packets
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              Threshold: {config.fraudThreshold} probability · Contamination: {config.anomalyContamination}. Predictions reflect active dataset evaluation.
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate("reports")}
              className="text-xs font-mono underline cursor-pointer"
              style={{ color: DANGER_COLOR }}
            >
              View Report →
            </button>
          )}
        </div>
      )}

      {/* KPI Grid - Credit Card Fraud */}
      <div>
        <p className="text-xs font-mono uppercase tracking-wider font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--muted-foreground)" }}>
          <span>💳</span> Credit Card Fraud Pipeline ({fraudDatasetName})
        </p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total Transactions" value={transactions.length.toLocaleString()} sub="Analyzed batch" badge="Random Forest" />
          <StatCard label="Legitimate" value={legitCount.toLocaleString()} sub={`${((legitCount / (transactions.length || 1)) * 100).toFixed(1)}% of total`} color={SAFE_COLOR} />
          <StatCard label="Potentially Fraudulent" value={fraudCount.toLocaleString()} sub={`Fraud rate: ${fraudRate}%`} color={DANGER_COLOR} />
          <StatCard label="Model Accuracy" value={`${fraudMetrics.accuracy}%`} sub={`F1-Score: ${fraudMetrics.f1}%`} color={PRIMARY_COLOR} />
        </div>
      </div>

      {/* KPI Grid - Network Anomaly */}
      <div>
        <p className="text-xs font-mono uppercase tracking-wider font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--muted-foreground)" }}>
          <span>🌐</span> Network Anomaly Pipeline ({networkDatasetName})
        </p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Network Records" value={networkRecords.length.toLocaleString()} sub="Activity flow records" badge="Isolation Forest" />
          <StatCard label="Normal Activity" value={normalCount.toLocaleString()} sub={`${((normalCount / (networkRecords.length || 1)) * 100).toFixed(1)}% safe`} color={SAFE_COLOR} />
          <StatCard label="Suspicious Activity" value={anomalyCount.toLocaleString()} sub={`Anomaly rate: ${anomalyRate}%`} color={PRIMARY_COLOR} />
          <StatCard label="Contamination Level" value={`${(config.anomalyContamination * 100).toFixed(0)}%`} sub="Outlier partition factor" color={ACCENT_COLOR} />
        </div>
      </div>

      {/* Charts Row 1: Pie Classifications */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Fraud pie */}
        <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              Transaction Classification Breakdown
            </p>
            <span className="text-[10px] font-mono" style={{ color: "var(--muted-foreground)" }}>
              Total: {transactions.length}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={fraudPie} cx="50%" cy="50%" innerRadius={58} outerRadius={85} dataKey="value" paddingAngle={3}>
                <Cell fill={SAFE_COLOR} />
                <Cell fill={DANGER_COLOR} />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(value) => <span className="text-xs font-mono" style={{ color: "var(--foreground)" }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Network pie */}
        <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              Network Activity Classification Breakdown
            </p>
            <span className="text-[10px] font-mono" style={{ color: "var(--muted-foreground)" }}>
              Total: {networkRecords.length}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={networkPie} cx="50%" cy="50%" innerRadius={58} outerRadius={85} dataKey="value" paddingAngle={3}>
                <Cell fill={ACCENT_COLOR} />
                <Cell fill={PRIMARY_COLOR} />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(value) => <span className="text-xs font-mono" style={{ color: "var(--foreground)" }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2: Distribution + Model metrics */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              Transaction Amount Distribution
            </p>
            <span className="text-[10px] font-mono" style={{ color: "var(--muted-foreground)" }}>
              Live Histogram
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={amountBuckets} barSize={26}>
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Transactions" fill={ACCENT_COLOR} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              Fraud Model Evaluation Metrics
            </p>
            <span className="text-[10px] font-mono" style={{ color: "var(--muted-foreground)" }}>
              {fraudMetrics.algorithm}
            </span>
          </div>
          <div className="flex flex-col gap-3 mt-2">
            {[
              { label: "Accuracy", value: fraudMetrics.accuracy, color: SAFE_COLOR },
              { label: "Precision", value: fraudMetrics.precision, color: ACCENT_COLOR },
              { label: "Recall", value: fraudMetrics.recall, color: PRIMARY_COLOR },
              { label: "F1-Score", value: fraudMetrics.f1, color: "#a78bfa" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs font-mono w-20 shrink-0 font-medium" style={{ color: "var(--muted-foreground)" }}>
                  {label}
                </span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--secondary)" }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
                </div>
                <span className="text-xs font-mono font-semibold w-12 text-right" style={{ color }}>
                  {value}%
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <p className="text-[10px] font-mono" style={{ color: "var(--muted-foreground)" }}>
              Version {fraudMetrics.modelVersion} · Trained: {fraudMetrics.trainingDate}
            </p>
            <span className="text-[10px] font-mono" style={{ color: SAFE_COLOR }}>
              class_weight="balanced"
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
