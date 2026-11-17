import { useState, useRef } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, BarChart, Bar } from "recharts";
import { useApp } from "../context/AppContext";
import { downloadCSV as saveCSV } from "../utils/csv";

const NORMAL = "#0ea5e9";
const ANOMALY = "#f59e0b";

function Badge({ text, type }: { text: string; type: "normal" | "anomaly" }) {
  return (
    <span
      className="px-2.5 py-1 rounded text-[11px] font-mono font-medium inline-flex items-center gap-1.5"
      style={{
        background: type === "normal" ? "rgba(14,165,233,0.12)" : "rgba(245,158,11,0.12)",
        color: type === "normal" ? NORMAL : ANOMALY,
        border: `1px solid ${type === "normal" ? "rgba(14,165,233,0.25)" : "rgba(245,158,11,0.25)"}`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: type === "normal" ? NORMAL : ANOMALY }} />
      {text}
    </span>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
      <div className="px-3 py-2 rounded text-xs font-mono shadow-md" style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
        <p className="font-semibold mb-1">{d.id}</p>
        <p>Protocol: {d.protocol?.toUpperCase()}</p>
        <p>Service: {d.service}</p>
        <p>Flag: {d.flag}</p>
        <p>Src Bytes: {d.srcBytes?.toLocaleString()}</p>
        <p>Anomaly Score: {d.anomalyScore}</p>
        <p className="font-semibold mt-1" style={{ color: d.status === "Suspicious Activity" ? ANOMALY : NORMAL }}>{d.status}</p>
      </div>
    );
  }
  return null;
};

const protocols = ["tcp", "udp", "icmp"];

export default function NetworkAnomaly() {
  const {
    networkRecords,
    networkDatasetName,
    parseAndAnalyzeNetworkCSV,
    predictSingleNetwork,
    loadDemoNetworkData,
    downloadSampleNetworkCSV,
    config,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"batch" | "single">("batch");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [filterProto, setFilterProto] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "normal" | "anomaly">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Single test form states
  const [singleProto, setSingleProto] = useState("tcp");
  const [singleService, setSingleService] = useState("http");
  const [singleFlag, setSingleFlag] = useState("SF");
  const [singleSrcBytes, setSingleSrcBytes] = useState(120000);
  const [singleDstBytes, setSingleDstBytes] = useState(0);
  const [singleDuration, setSingleDuration] = useState(2.4);
  const [singleResult, setSingleResult] = useState<ReturnType<typeof predictSingleNetwork> | null>(null);

  const anomalyCount = networkRecords.filter((r) => r.status === "Suspicious Activity").length;
  const normalCount = networkRecords.length - anomalyCount;
  const anomalyRate = networkRecords.length ? ((anomalyCount / networkRecords.length) * 100).toFixed(1) : "0.0";

  const protoCounts = protocols.map((p) => ({
    protocol: p.toUpperCase(),
    normal: networkRecords.filter((r) => r.protocol?.toLowerCase() === p && r.status === "Normal Activity").length,
    anomaly: networkRecords.filter((r) => r.protocol?.toLowerCase() === p && r.status === "Suspicious Activity").length,
  }));

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

    let res: Awaited<ReturnType<typeof parseAndAnalyzeNetworkCSV>>;
    try {
      res = await parseAndAnalyzeNetworkCSV(file);
    } catch (error) {
      res = { success: false, count: 0, error: error instanceof Error ? error.message : "Unexpected upload error." };
    } finally {
      setLoading(false);
    }

    if (res.success) {
      setSuccessMsg(`Successfully processed ${res.count} network records from ${file.name}`);
    } else {
      setErrorMsg(res.error || "Failed to process network CSV.");
    }

    if (fileRef.current) fileRef.current.value = "";
  };

  const handleRunSingleTest = (e: React.FormEvent) => {
    e.preventDefault();
    const res = predictSingleNetwork(singleProto, singleService, singleFlag, singleSrcBytes, singleDstBytes, singleDuration);
    setSingleResult(res);
  };

  const downloadCSV = () => {
    saveCSV(`network_anomaly_results_${new Date().toISOString().slice(0, 10)}.csv`, [
      ["Record ID", "Protocol", "Service", "Flag", "Src Bytes", "Dst Bytes", "Duration (s)", "Status", "Anomaly Score"],
      ...networkRecords.map((r) => [r.id, r.protocol, r.service, r.flag, r.srcBytes, r.dstBytes, r.duration, r.status, r.anomalyScore]),
    ]);
  };

  const filtered = networkRecords
    .filter((r) => (filterProto === "all" ? true : r.protocol?.toLowerCase() === filterProto))
    .filter((r) => {
      if (filterStatus === "anomaly") return r.status === "Suspicious Activity";
      if (filterStatus === "normal") return r.status === "Normal Activity";
      return true;
    })
    .filter((r) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return r.id.toLowerCase().includes(q) || r.service?.toLowerCase().includes(q) || r.flag?.toLowerCase().includes(q);
    });

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Network Anomaly Detection
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
            Isolation Forest · Unsupervised Outlier Partitioning · Contamination: {config.anomalyContamination}
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
            Live Packet Test
          </button>
        </div>
      </div>

      {/* Isolation Forest Info Box */}
      <div className="rounded-xl px-4 py-3 text-xs border" style={{ background: "rgba(14,165,233,0.06)", borderColor: "rgba(14,165,233,0.2)" }}>
        <p className="font-semibold mb-1" style={{ color: NORMAL }}>Principle of Isolation Forest</p>
        <p className="leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          The algorithm isolates anomalies by recursively splitting random attributes. Because unusual network events (e.g. DoS floods, abnormal port sweeps) occupy sparse dimensional spaces, they require fewer random cuts to isolate (short average path length → high anomaly score ≥ 0.5). Output: score &ge; 0.50 &rarr; Suspicious Activity, &lt; 0.50 &rarr; Normal Activity.
        </p>
      </div>

      {activeTab === "batch" ? (
        <>
          {/* Upload + Demo utilities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div
              className="lg:col-span-2 rounded-xl p-6 flex flex-col items-center justify-center gap-2.5 border-2 border-dashed transition-all text-center"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="text-3xl opacity-60">🌐</div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  {loading ? "Analyzing network packets…" : `Current Dataset: ${networkDatasetName}`}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                  Upload CSV with fields: duration, protocol_type, service, flag, src_bytes, dst_bytes
                </p>
              </div>

              <label
                className="mt-1 px-5 py-2.5 rounded-lg text-xs font-mono font-semibold cursor-pointer transition-colors inline-flex items-center gap-2"
                style={{ background: "var(--accent)", color: "white" }}
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
                  <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
                  <span className="text-xs font-mono" style={{ color: "var(--accent)" }}>Partitioning Isolation Trees…</span>
                </div>
              )}
            </div>

            {/* Viva Demo Actions */}
            <div className="rounded-xl p-5 flex flex-col justify-between" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div>
                <p className="text-xs font-mono uppercase tracking-wider font-semibold mb-2" style={{ color: "var(--accent)" }}>
                  Viva & Demo Utilities
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  Download a pre-structured NSL-KDD compatible sample network CSV, or reload baseline records.
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={downloadSampleNetworkCSV}
                  className="w-full py-2 px-3 rounded-lg text-xs font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  style={{ background: "rgba(14,165,233,0.12)", color: NORMAL, border: "1px solid rgba(14,165,233,0.25)" }}
                >
                  <span>⬇</span> Download Network CSV
                </button>
                <button
                  onClick={loadDemoNetworkData}
                  className="w-full py-2 px-3 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                  style={{ background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)" }}
                >
                  ↺ Reload Baseline Records
                </button>
              </div>
            </div>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 rounded-lg text-xs font-mono" style={{ background: "rgba(244,63,94,0.1)", color: "#f43f5e", border: "1px solid rgba(244,63,94,0.25)" }}>
              ✕ {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-lg text-xs font-mono" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}>
              ✓ {successMsg}
            </div>
          )}

          {/* Alert */}
          {anomalyCount > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
              <span>⚠️</span>
              <p className="text-xs font-medium" style={{ color: ANOMALY }}>
                {anomalyCount} suspicious network record{anomalyCount !== 1 ? "s" : ""} isolated. Contamination parameter: {(config.anomalyContamination * 100).toFixed(0)}%.
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total Records", value: networkRecords.length.toLocaleString() },
              { label: "Normal Activity", value: normalCount.toLocaleString(), color: NORMAL },
              { label: "Suspicious Activity", value: anomalyCount.toLocaleString(), color: ANOMALY },
              { label: "Anomaly Rate", value: `${anomalyRate}%`, color: "#a78bfa" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <p className="text-[10px] uppercase tracking-widest font-mono mb-1.5" style={{ color: "var(--muted-foreground)" }}>{label}</p>
                <p className="font-display text-xl font-bold" style={{ color: color ?? "var(--foreground)" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Scatter */}
            <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  Source Bytes vs Anomaly Score Scatter
                </p>
                <span className="text-[10px] font-mono" style={{ color: "var(--muted-foreground)" }}>
                  Amber = Anomaly · Blue = Normal
                </span>
              </div>
              <ResponsiveContainer width="100%" height={190}>
                <ScatterChart>
                  <XAxis dataKey="srcBytes" name="Src Bytes" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
                  <YAxis dataKey="anomalyScore" name="Score" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} domain={[0, 1]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Scatter data={networkRecords} name="Records">
                    {networkRecords.map((r) => (
                      <Cell key={r.id} fill={r.status === "Suspicious Activity" ? ANOMALY : NORMAL} fillOpacity={0.75} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Protocol breakdown */}
            <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  Activity Distribution by Protocol
                </p>
                <span className="text-[10px] font-mono" style={{ color: "var(--muted-foreground)" }}>
                  TCP / UDP / ICMP
                </span>
              </div>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={protoCounts} barSize={22} barGap={4}>
                  <XAxis dataKey="protocol" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={({ active, payload, label }: any) =>
                    active && payload?.length ? (
                      <div className="px-3 py-2 rounded text-xs font-mono shadow-md" style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
                        <p className="opacity-70 mb-1 font-semibold">{label}</p>
                        {payload.map((p: any) => (
                          <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
                        ))}
                      </div>
                    ) : null
                  } />
                  <Bar dataKey="normal" name="Normal" fill={NORMAL} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="anomaly" name="Suspicious" fill={ANOMALY} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-muted-foreground mr-1">Protocol:</span>
              {["all", ...protocols].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterProto(p)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                  style={{
                    background: filterProto === p ? "var(--primary)" : "var(--secondary)",
                    color: filterProto === p ? "var(--primary-foreground)" : "var(--muted-foreground)",
                    fontWeight: filterProto === p ? 600 : 400,
                  }}
                >
                  {p.toUpperCase()}
                </button>
              ))}

              <span className="text-xs font-mono text-muted-foreground ml-2 mr-1">Status:</span>
              {(["all", "anomaly", "normal"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                  style={{
                    background: filterStatus === s ? "var(--primary)" : "var(--secondary)",
                    color: filterStatus === s ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  }}
                >
                  {s === "all" ? "All" : s === "anomaly" ? "Suspicious" : "Normal"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search ID/Service/Flag…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono outline-none w-44"
                style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              />
              <button
                onClick={downloadCSV}
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
                    {["Record ID", "Protocol", "Service", "Flag", "Src Bytes", "Dst Bytes", "Duration", "Status", "Anomaly Score"].map((h) => (
                      <th key={h} className="text-left px-3 py-3 font-mono uppercase tracking-wider text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, config.maxDisplayRows).map((r, i) => {
                    const isAnom = r.status === "Suspicious Activity";
                    return (
                      <tr
                        key={r.id}
                        className="transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                        style={{
                          background: isAnom ? "rgba(245,158,11,0.05)" : i % 2 === 0 ? "transparent" : "rgba(148,163,184,0.02)",
                          borderLeft: isAnom ? `3px solid ${ANOMALY}` : "3px solid transparent",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <td className="px-3 py-2.5 font-mono font-medium" style={{ color: "var(--foreground)" }}>{r.id}</td>
                        <td className="px-3 py-2.5 font-mono uppercase" style={{ color: "var(--muted-foreground)" }}>{r.protocol}</td>
                        <td className="px-3 py-2.5 font-mono" style={{ color: "var(--muted-foreground)" }}>{r.service}</td>
                        <td className="px-3 py-2.5 font-mono font-semibold" style={{ color: r.flag === "SF" ? "var(--foreground)" : ANOMALY }}>{r.flag}</td>
                        <td className="px-3 py-2.5 font-mono font-medium" style={{ color: "var(--foreground)" }}>{r.srcBytes?.toLocaleString()}</td>
                        <td className="px-3 py-2.5 font-mono" style={{ color: "var(--muted-foreground)" }}>{r.dstBytes?.toLocaleString()}</td>
                        <td className="px-3 py-2.5 font-mono" style={{ color: "var(--muted-foreground)" }}>{r.duration}s</td>
                        <td className="px-3 py-2.5">
                          <Badge text={r.status} type={isAnom ? "anomaly" : "normal"} />
                        </td>
                        <td className="px-3 py-2.5 font-mono font-semibold" style={{ color: isAnom ? ANOMALY : NORMAL }}>
                          {r.anomalyScore}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2.5 border-t text-[10px] font-mono flex items-center justify-between" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
              <span>Showing {Math.min(config.maxDisplayRows, filtered.length)} of {filtered.length} filtered records</span>
              <span>Dataset: {networkDatasetName}</span>
            </div>
          </div>
        </>
      ) : (
        /* Single Packet Test */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handleRunSingleTest} className="rounded-xl p-6 flex flex-col gap-4 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div>
              <p className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
                Single Network Packet Inspector
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                Test instantaneous Isolation Forest tree partition depth for a specific traffic profile.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase" style={{ color: "var(--muted-foreground)" }}>
                  Protocol
                </label>
                <select
                  value={singleProto}
                  onChange={(e) => setSingleProto(e.target.value)}
                  className="px-3 py-2 rounded-lg text-sm font-mono outline-none"
                  style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                >
                  <option value="tcp">TCP</option>
                  <option value="udp">UDP</option>
                  <option value="icmp">ICMP</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase" style={{ color: "var(--muted-foreground)" }}>
                  Service
                </label>
                <select
                  value={singleService}
                  onChange={(e) => setSingleService(e.target.value)}
                  className="px-3 py-2 rounded-lg text-sm font-mono outline-none"
                  style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                >
                  <option value="http">http</option>
                  <option value="ssh">ssh</option>
                  <option value="dns">dns</option>
                  <option value="ftp">ftp</option>
                  <option value="telnet">telnet</option>
                  <option value="smtp">smtp</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase" style={{ color: "var(--muted-foreground)" }}>
                  TCP Flag
                </label>
                <select
                  value={singleFlag}
                  onChange={(e) => setSingleFlag(e.target.value)}
                  className="px-3 py-2 rounded-lg text-sm font-mono outline-none"
                  style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                >
                  <option value="SF">SF (Normal)</option>
                  <option value="S0">S0 (SYN Flood)</option>
                  <option value="REJ">REJ (Rejected)</option>
                  <option value="RSTO">RSTO (Reset)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase" style={{ color: "var(--muted-foreground)" }}>
                  Source Bytes
                </label>
                <input
                  type="number"
                  value={singleSrcBytes}
                  onChange={(e) => setSingleSrcBytes(parseInt(e.target.value) || 0)}
                  className="px-3 py-2 rounded-lg text-sm font-mono outline-none"
                  style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase" style={{ color: "var(--muted-foreground)" }}>
                  Destination Bytes
                </label>
                <input
                  type="number"
                  value={singleDstBytes}
                  onChange={(e) => setSingleDstBytes(parseInt(e.target.value) || 0)}
                  className="px-3 py-2 rounded-lg text-sm font-mono outline-none"
                  style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase" style={{ color: "var(--muted-foreground)" }}>
                Duration (seconds)
              </label>
              <input
                type="number"
                step="0.1"
                value={singleDuration}
                onChange={(e) => setSingleDuration(parseFloat(e.target.value) || 0)}
                className="px-3 py-2 rounded-lg text-sm font-mono outline-none"
                style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer"
                style={{ background: "var(--accent)", color: "white" }}
              >
                ⚡ Evaluate Packet Anomaly
              </button>
              <button
                type="button"
                onClick={() => {
                  setSingleProto("tcp");
                  setSingleService("http");
                  setSingleFlag("S0");
                  setSingleSrcBytes(450000);
                  setSingleDstBytes(0);
                  setSingleDuration(0.1);
                }}
                className="px-3 py-2.5 rounded-lg text-xs font-mono cursor-pointer"
                style={{ background: "rgba(245,158,11,0.12)", color: ANOMALY, border: "1px solid rgba(245,158,11,0.25)" }}
              >
                Load DoS Preset
              </button>
            </div>
          </form>

          {/* Result card */}
          <div className="rounded-xl p-6 flex flex-col justify-between border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div>
              <p className="text-base font-semibold mb-3" style={{ color: "var(--foreground)" }}>
                Packet Anomaly Diagnosis
              </p>

              {singleResult ? (
                <div className="flex flex-col gap-4">
                  <div
                    className="p-4 rounded-xl flex items-center justify-between"
                    style={{
                      background: singleResult.status === "Suspicious Activity" ? "rgba(245,158,11,0.1)" : "rgba(14,165,233,0.1)",
                      border: `1px solid ${singleResult.status === "Suspicious Activity" ? "rgba(245,158,11,0.3)" : "rgba(14,165,233,0.3)"}`,
                    }}
                  >
                    <div>
                      <p className="text-xs uppercase font-mono tracking-wider text-muted-foreground">Classification</p>
                      <p className="font-display text-2xl font-bold mt-1" style={{ color: singleResult.status === "Suspicious Activity" ? ANOMALY : NORMAL }}>
                        {singleResult.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase font-mono tracking-wider text-muted-foreground">Anomaly Score</p>
                      <p className="font-display text-2xl font-bold mt-1" style={{ color: singleResult.status === "Suspicious Activity" ? ANOMALY : NORMAL }}>
                        {singleResult.anomalyScore}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg" style={{ background: "var(--secondary)" }}>
                    <p className="text-xs font-mono uppercase tracking-wider mb-1 font-semibold" style={{ color: "var(--muted-foreground)" }}>
                      Detection Reason / Vector Analysis:
                    </p>
                    <p className="text-xs font-mono leading-relaxed" style={{ color: "var(--foreground)" }}>
                      {singleResult.reason}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg text-[11px] font-mono" style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)", color: "var(--muted-foreground)" }}>
                    Path Length Partition Factor: {(1 - singleResult.anomalyScore).toFixed(3)}. Score &ge; 0.50 triggers automated SIEM alert.
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-xs font-mono opacity-60">
                  Select packet parameters and click "Evaluate Packet Anomaly"
                </div>
              )}
            </div>

            <div className="pt-4 border-t text-[10px] font-mono" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
              Model: Isolation Forest (100 Trees) · Contamination = {config.anomalyContamination}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
