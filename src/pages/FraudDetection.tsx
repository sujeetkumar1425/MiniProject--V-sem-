import { useState, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useApp } from "../context/AppContext";
import { downloadCSV as saveCSV } from "../utils/csv";

const SAFE = "#10b981";
const DANGER = "#f43f5e";

function Badge({ text, type }: { text: string; type: "safe" | "danger" }) {
  return (
    <span
      className="px-2.5 py-1 rounded text-[11px] font-mono font-medium inline-flex items-center gap-1.5"
      style={{
        background: type === "safe" ? "rgba(16,185,129,0.12)" : "rgba(244,63,94,0.12)",
        color: type === "safe" ? SAFE : DANGER,
        border: `1px solid ${type === "safe" ? "rgba(16,185,129,0.25)" : "rgba(244,63,94,0.25)"}`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: type === "safe" ? SAFE : DANGER }} />
      {text}
    </span>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="px-3 py-2 rounded text-xs font-mono shadow-md" style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
        <p className="opacity-70 mb-1 font-semibold">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function FraudDetection() {
  const {
    transactions,
    fraudDatasetName,
    parseAndAnalyzeFraudCSV,
    predictSingleTransaction,
    loadDemoFraudData,
    downloadSampleFraudCSV,
    config,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"batch" | "single">("batch");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "fraud" | "legit">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Single test form states
  const [singleAmount, setSingleAmount] = useState<number>(450.0);
  const [singleTime, setSingleTime] = useState<number>(3600);
  const [singleV1, setSingleV1] = useState<number>(-0.85);
  const [singleV14, setSingleV14] = useState<number>(-3.2);
  const [singleV17, setSingleV17] = useState<number>(-2.8);
  const [singleResult, setSingleResult] = useState<ReturnType<typeof predictSingleTransaction> | null>(null);

  const fraudCount = transactions.filter((t) => t.prediction === "Potentially Fraudulent").length;
  const legitCount = transactions.length - fraudCount;
  const fraudRate = transactions.length ? ((fraudCount / transactions.length) * 100).toFixed(2) : "0.00";

  const amountBuckets = [
    { range: "$0–100", legit: 0, fraud: 0 },
    { range: "$100–500", legit: 0, fraud: 0 },
    { range: "$500–1k", legit: 0, fraud: 0 },
    { range: "$1k+", legit: 0, fraud: 0 },
  ];

  transactions.forEach((t) => {
    const key = t.prediction === "Potentially Fraudulent" ? "fraud" : "legit";
    if (t.amount < 100) amountBuckets[0][key]++;
    else if (t.amount < 500) amountBuckets[1][key]++;
    else if (t.amount < 1000) amountBuckets[2][key]++;
    else amountBuckets[3][key]++;
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setErrorMsg("Please upload a valid .csv file.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (file.size > config.maxFileSize * 1024 * 1024) {
      setErrorMsg(`File too large. Maximum size is ${config.maxFileSize}MB.`);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    let res: Awaited<ReturnType<typeof parseAndAnalyzeFraudCSV>>;
    try {
      res = await parseAndAnalyzeFraudCSV(file);
    } catch (error) {
      res = { success: false, count: 0, error: error instanceof Error ? error.message : "Unexpected upload error." };
    } finally {
      setLoading(false);
    }

    if (res.success) {
      setSuccessMsg(`Successfully processed ${res.count} transactions from ${file.name}`);
    } else {
      setErrorMsg(res.error || "Failed to process transaction file.");
    }

    if (fileRef.current) fileRef.current.value = "";
  };

  const handleRunSingleTest = (e: React.FormEvent) => {
    e.preventDefault();
    const res = predictSingleTransaction(singleAmount, singleTime, singleV1, singleV14, singleV17);
    setSingleResult(res);
  };

  const downloadResultsCSV = () => {
    saveCSV(`fraud_detection_results_${new Date().toISOString().slice(0, 10)}.csv`, [
      ["Transaction ID", "Time (s)", "Amount ($)", "V1", "V14", "V17", "Prediction", "Confidence (%)"],
      ...transactions.map((t) => [t.id, t.time, t.amount, t.v1, t.v14, t.v17, t.prediction, t.confidence]),
    ]);
  };

  const filtered = transactions
    .filter((t) => {
      if (filterMode === "fraud") return t.prediction === "Potentially Fraudulent";
      if (filterMode === "legit") return t.prediction === "Legitimate";
      return true;
    })
    .filter((t) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return t.id.toLowerCase().includes(q) || String(t.amount).includes(q);
    });

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Credit Card Fraud Detection
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
            Random Forest Classifier · class_weight="balanced" · Decision Threshold: {config.fraudThreshold}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}>
          <button
            onClick={() => setActiveTab("batch")}
            className="px-3 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer"
            style={{
              background: activeTab === "batch" ? "var(--primary)" : "transparent",
              color: activeTab === "batch" ? "var(--primary-foreground)" : "var(--muted-foreground)",
              fontWeight: activeTab === "batch" ? 600 : 400,
            }}
          >
            Batch CSV Analysis
          </button>
          <button
            onClick={() => setActiveTab("single")}
            className="px-3 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer"
            style={{
              background: activeTab === "single" ? "var(--primary)" : "transparent",
              color: activeTab === "single" ? "var(--primary-foreground)" : "var(--muted-foreground)",
              fontWeight: activeTab === "single" ? 600 : 400,
            }}
          >
            Live Single Test
          </button>
        </div>
      </div>

      {activeTab === "batch" ? (
        <>
          {/* Upload Zone & Quick Sample Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div
              className="lg:col-span-2 rounded-xl p-6 flex flex-col items-center justify-center gap-2.5 border-2 border-dashed transition-all text-center"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="text-3xl opacity-60">📂</div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  {loading ? "Analyzing transactions…" : `Current Dataset: ${fraudDatasetName}`}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                  Upload CSV with columns: Time, Amount, V1–V28 · Max {config.maxFileSize}MB
                </p>
              </div>

              <label
                className="mt-1 px-5 py-2.5 rounded-lg text-xs font-mono font-semibold cursor-pointer transition-colors inline-flex items-center gap-2"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                📁 Choose CSV File
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleUpload}
                />
              </label>

              {loading && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
                  <span className="text-xs font-mono" style={{ color: "var(--primary)" }}>Running Random Forest Inference…</span>
                </div>
              )}
            </div>

            {/* Viva Demonstration Actions Card */}
            <div className="rounded-xl p-5 flex flex-col justify-between" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div>
                <p className="text-xs font-mono uppercase tracking-wider font-semibold mb-2" style={{ color: "var(--primary)" }}>
                  Viva & Demo Utilities
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  Download a pre-generated sample dataset for testing, or restore default college demo data.
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={downloadSampleFraudCSV}
                  className="w-full py-2 px-3 rounded-lg text-xs font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  style={{ background: "rgba(245,158,11,0.12)", color: "var(--primary)", border: "1px solid rgba(245,158,11,0.25)" }}
                >
                  <span>⬇</span> Download Sample CSV
                </button>
                <button
                  onClick={loadDemoFraudData}
                  className="w-full py-2 px-3 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                  style={{ background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)" }}
                >
                  ↺ Reload Baseline Demo
                </button>
              </div>
            </div>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 rounded-lg text-xs font-mono" style={{ background: "rgba(244,63,94,0.1)", color: DANGER, border: "1px solid rgba(244,63,94,0.25)" }}>
              ✕ {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-lg text-xs font-mono" style={{ background: "rgba(16,185,129,0.1)", color: SAFE, border: "1px solid rgba(16,185,129,0.25)" }}>
              ✓ {successMsg}
            </div>
          )}

          {/* Alert Banner */}
          {fraudCount > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.25)" }}>
              <span className="text-lg">⚠️</span>
              <p className="text-xs font-medium" style={{ color: DANGER }}>
                {fraudCount} potentially fraudulent transaction{fraudCount !== 1 ? "s" : ""} flagged. Noticeable variance in V14/V17 component vectors.
              </p>
            </div>
          )}

          {/* Metrics row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total Transactions", value: transactions.length.toLocaleString() },
              { label: "Legitimate", value: legitCount.toLocaleString(), color: SAFE },
              { label: "Potentially Fraudulent", value: fraudCount.toLocaleString(), color: DANGER },
              { label: "Fraud Rate", value: `${fraudRate}%`, color: "var(--primary)" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <p className="text-[10px] uppercase tracking-widest font-mono mb-1.5" style={{ color: "var(--muted-foreground)" }}>{label}</p>
                <p className="font-display text-xl font-bold" style={{ color: color ?? "var(--foreground)" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                Transaction Amount Distribution by Predicted Class
              </p>
              <span className="text-[10px] font-mono" style={{ color: "var(--muted-foreground)" }}>
                Green = Legitimate · Red = Fraudulent
              </span>
            </div>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={amountBuckets} barSize={20} barGap={4}>
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="legit" name="Legitimate" fill={SAFE} radius={[3, 3, 0, 0]} />
                <Bar dataKey="fraud" name="Potentially Fraudulent" fill={DANGER} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Filter Bar & Export */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {(["all", "fraud", "legit"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                  style={{
                    background: filterMode === mode ? "var(--primary)" : "var(--secondary)",
                    color: filterMode === mode ? "var(--primary-foreground)" : "var(--muted-foreground)",
                    fontWeight: filterMode === mode ? 600 : 400,
                  }}
                >
                  {mode === "all" ? `All (${transactions.length})` : mode === "fraud" ? `Fraud (${fraudCount})` : `Legit (${legitCount})`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search ID or Amount…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono outline-none w-44"
                style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              />
              <button
                onClick={downloadResultsCSV}
                className="px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
                style={{ background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)" }}
              >
                <span>↓</span> Export CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl overflow-hidden border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--secondary)" }}>
                    {["Transaction ID", "Time (s)", "Amount ($)", "V1", "V14", "V17", "Prediction", "Confidence"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-mono uppercase tracking-wider text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, config.maxDisplayRows).map((t, i) => {
                    const isFraud = t.prediction === "Potentially Fraudulent";
                    return (
                      <tr
                        key={t.id}
                        className="transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                        style={{
                          background: isFraud ? "rgba(244,63,94,0.05)" : i % 2 === 0 ? "transparent" : "rgba(148,163,184,0.02)",
                          borderLeft: isFraud ? `3px solid ${DANGER}` : "3px solid transparent",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <td className="px-4 py-3 font-mono font-medium" style={{ color: "var(--foreground)" }}>{t.id}</td>
                        <td className="px-4 py-3 font-mono" style={{ color: "var(--muted-foreground)" }}>{t.time.toLocaleString()}</td>
                        <td className="px-4 py-3 font-mono font-semibold" style={{ color: "var(--foreground)" }}>${t.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 font-mono" style={{ color: "var(--muted-foreground)" }}>{t.v1.toFixed(3)}</td>
                        <td className="px-4 py-3 font-mono" style={{ color: t.v14 < -2 ? DANGER : "var(--muted-foreground)" }}>{t.v14.toFixed(3)}</td>
                        <td className="px-4 py-3 font-mono" style={{ color: t.v17 < -2 ? DANGER : "var(--muted-foreground)" }}>{t.v17.toFixed(3)}</td>
                        <td className="px-4 py-3">
                          <Badge text={t.prediction} type={isFraud ? "danger" : "safe"} />
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold" style={{ color: isFraud ? DANGER : SAFE }}>
                          {t.confidence}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2.5 border-t text-[10px] font-mono flex items-center justify-between" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
              <span>Showing {Math.min(config.maxDisplayRows, filtered.length)} of {filtered.length} filtered records</span>
              <span>Dataset: {fraudDatasetName}</span>
            </div>
          </div>
        </>
      ) : (
        /* Single Transaction Interactive Live Tester */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handleRunSingleTest} className="rounded-xl p-6 flex flex-col gap-4 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div>
              <p className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
                Single Transaction Feature Input
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                Enter custom parameter values to evaluate instantaneous Random Forest model inference.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase" style={{ color: "var(--muted-foreground)" }}>
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={singleAmount}
                  onChange={(e) => setSingleAmount(parseFloat(e.target.value) || 0)}
                  className="px-3 py-2 rounded-lg text-sm font-mono outline-none"
                  style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase" style={{ color: "var(--muted-foreground)" }}>
                  Time (s)
                </label>
                <input
                  type="number"
                  value={singleTime}
                  onChange={(e) => setSingleTime(parseInt(e.target.value) || 0)}
                  className="px-3 py-2 rounded-lg text-sm font-mono outline-none"
                  style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase flex items-center justify-between" style={{ color: "var(--muted-foreground)" }}>
                <span>V1 Feature (Transaction Latent Vector)</span>
                <span className="font-mono text-[10px]">{singleV1}</span>
              </label>
              <input
                type="range" min={-5} max={5} step={0.1}
                value={singleV1}
                onChange={(e) => setSingleV1(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase flex items-center justify-between" style={{ color: "var(--muted-foreground)" }}>
                <span>V14 Feature (Critical Negative Correlation)</span>
                <span className="font-mono text-[10px]" style={{ color: singleV14 < -2 ? DANGER : "inherit" }}>{singleV14}</span>
              </label>
              <input
                type="range" min={-6} max={4} step={0.1}
                value={singleV14}
                onChange={(e) => setSingleV14(parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Values &lt; -2.0 strongly trigger fraud indicators</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase flex items-center justify-between" style={{ color: "var(--muted-foreground)" }}>
                <span>V17 Feature (Critical Negative Correlation)</span>
                <span className="font-mono text-[10px]" style={{ color: singleV17 < -2 ? DANGER : "inherit" }}>{singleV17}</span>
              </label>
              <input
                type="range" min={-6} max={4} step={0.1}
                value={singleV17}
                onChange={(e) => setSingleV17(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                ⚡ Run Real-Time Prediction
              </button>
              <button
                type="button"
                onClick={() => {
                  setSingleAmount(2400.0);
                  setSingleV14(-4.8);
                  setSingleV17(-3.9);
                }}
                className="px-3 py-2.5 rounded-lg text-xs font-mono cursor-pointer"
                style={{ background: "rgba(244,63,94,0.12)", color: DANGER, border: "1px solid rgba(244,63,94,0.25)" }}
              >
                Load Suspicious Preset
              </button>
            </div>
          </form>

          {/* Result Card */}
          <div className="rounded-xl p-6 flex flex-col justify-between border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div>
              <p className="text-base font-semibold mb-3" style={{ color: "var(--foreground)" }}>
                Prediction Diagnostics
              </p>

              {singleResult ? (
                <div className="flex flex-col gap-4">
                  <div
                    className="p-4 rounded-xl flex items-center justify-between"
                    style={{
                      background: singleResult.prediction === "Potentially Fraudulent" ? "rgba(244,63,94,0.1)" : "rgba(16,185,129,0.1)",
                      border: `1px solid ${singleResult.prediction === "Potentially Fraudulent" ? "rgba(244,63,94,0.3)" : "rgba(16,185,129,0.3)"}`,
                    }}
                  >
                    <div>
                      <p className="text-xs uppercase font-mono tracking-wider text-muted-foreground">Classification</p>
                      <p className="font-display text-2xl font-bold mt-1" style={{ color: singleResult.prediction === "Potentially Fraudulent" ? DANGER : SAFE }}>
                        {singleResult.prediction}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase font-mono tracking-wider text-muted-foreground">Confidence</p>
                      <p className="font-display text-2xl font-bold mt-1" style={{ color: singleResult.prediction === "Potentially Fraudulent" ? DANGER : SAFE }}>
                        {singleResult.confidence}%
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider mb-2 font-semibold" style={{ color: "var(--muted-foreground)" }}>
                      Risk Factor Analysis:
                    </p>
                    <ul className="flex flex-col gap-1.5">
                      {singleResult.riskFactors.map((rf, idx) => (
                        <li key={idx} className="text-xs p-2.5 rounded-lg font-mono flex items-start gap-2" style={{ background: "var(--secondary)" }}>
                          <span>•</span>
                          <span>{rf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg text-[11px] font-mono" style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)", color: "var(--muted-foreground)" }}>
                    Calculated Raw Probability Score: {singleResult.riskScore} (Threshold: {config.fraudThreshold})
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-xs font-mono opacity-60">
                  Fill in transaction parameters and click "Run Real-Time Prediction"
                </div>
              )}
            </div>

            <div className="pt-4 border-t text-[10px] font-mono" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
              Model: Random Forest (200 Trees) · Evaluation based on ULB Credit Card Fraud benchmark
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
