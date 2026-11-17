import { useState } from "react";
import { useApp } from "../context/AppContext";
import { downloadCSV } from "../utils/csv";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="px-5 py-3.5 border-b" style={{ borderColor: "var(--border)" }}>
        <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{title}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Row({ label, value, mono = true, color }: { label: string; value: string; mono?: boolean; color?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{label}</span>
      <span className={`text-xs ${mono ? "font-mono" : ""}`} style={{ color: color ?? "var(--foreground)" }}>{value}</span>
    </div>
  );
}

export default function Reports() {
  const {
    transactions,
    networkRecords,
    fraudMetrics,
    anomalyMetrics,
    fraudDatasetName,
    networkDatasetName,
    config,
    reportAudits,
  } = useApp();

  const [printMode, setPrintMode] = useState(false);

  const fraudTotal = transactions.length;
  const fraudCount = transactions.filter((t) => t.prediction === "Potentially Fraudulent").length;
  const legitCount = fraudTotal - fraudCount;
  const fraudRate = fraudTotal ? ((fraudCount / fraudTotal) * 100).toFixed(2) : "0.00";

  const netTotal = networkRecords.length;
  const anomalyCount = networkRecords.filter((r) => r.status === "Suspicious Activity").length;
  const normalCount = netTotal - anomalyCount;
  const anomalyRate = netTotal ? ((anomalyCount / netTotal) * 100).toFixed(1) : "0.0";

  const [[tn, fp], [fn, tp]] = fraudMetrics.confusionMatrix;

  const downloadFraudReport = () => {
    const rows = [
      "ACADEMIC EVALUATION REPORT: CREDIT CARD FRAUD DETECTION",
      `Generated: ${new Date().toISOString()}`,
      `Dataset: ${fraudDatasetName}`,
      "",
      "--- BATCH STATISTICS ---",
      `Total Transactions,${fraudTotal}`,
      `Legitimate Count,${legitCount}`,
      `Potentially Fraudulent Count,${fraudCount}`,
      `Fraud Rate,${fraudRate}%`,
      "",
      "--- SUPERVISED MODEL EVALUATION ---",
      `Algorithm,${fraudMetrics.algorithm}`,
      `Version,${fraudMetrics.modelVersion}`,
      `Training Date,${fraudMetrics.trainingDate}`,
      `Accuracy,${fraudMetrics.accuracy}%`,
      `Precision,${fraudMetrics.precision}%`,
      `Recall (Sensitivity),${fraudMetrics.recall}%`,
      `F1-Score,${fraudMetrics.f1}%`,
      `n_estimators,${fraudMetrics.nEstimators}`,
      `Decision Threshold,${config.fraudThreshold}`,
      "",
      "--- CONFUSION MATRIX ---",
      `True Negatives (TN),${tn}`,
      `False Positives (FP),${fp}`,
      `False Negatives (FN),${fn}`,
      `True Positives (TP),${tp}`,
    ];
    rows.push("", "--- SCAN RESULTS ---", "Transaction ID,Time (s),Amount,V1,V14,V17,Prediction,Confidence (%)");
    transactions.forEach((item) => rows.push([item.id, item.time, item.amount, item.v1, item.v14, item.v17, item.prediction, item.confidence].join(",")));
    downloadCSV(`fraud_report_${new Date().toISOString().slice(0, 10)}.csv`, rows.map((line) => line.split(",")));
  };

  const downloadNetReport = () => {
    const rows = [
      "ACADEMIC EVALUATION REPORT: NETWORK ANOMALY DETECTION",
      `Generated: ${new Date().toISOString()}`,
      `Dataset: ${networkDatasetName}`,
      "",
      "--- TELEMETRY STATISTICS ---",
      `Total Network Records,${netTotal}`,
      `Normal Activity Count,${normalCount}`,
      `Suspicious Activity Count,${anomalyCount}`,
      `Anomaly Rate,${anomalyRate}%`,
      "",
      "--- UNSUPERVISED MODEL METADATA ---",
      `Algorithm,${anomalyMetrics.algorithm}`,
      `Version,${anomalyMetrics.modelVersion}`,
      `Training Date,${anomalyMetrics.trainingDate}`,
      `Contamination Parameter,${config.anomalyContamination}`,
      `n_estimators,${anomalyMetrics.nEstimators}`,
      "",
      "VIVA NOTE: Supervised evaluation metrics cannot be computed without labeled ground truth.",
      "Isolation Forest is unsupervised and reports average partition path lengths & contamination ratios.",
    ];
    rows.push("", "--- SCAN RESULTS ---", "Record ID,Protocol,Service,Flag,Source Bytes,Destination Bytes,Duration (s),Status,Anomaly Score");
    networkRecords.forEach((item) => rows.push([item.id, item.protocol, item.service, item.flag, item.srcBytes, item.dstBytes, item.duration, item.status, item.anomalyScore].join(",")));
    downloadCSV(`network_anomaly_report_${new Date().toISOString().slice(0, 10)}.csv`, rows.map((line) => line.split(",")));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${printMode ? "no-print" : ""}`}>
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Analytical Reports & Audit Log
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
            Academic project deliverables, model performance evaluation, and printable audit transcripts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPrintMode(!printMode)}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer"
            style={{ background: printMode ? "var(--primary)" : "var(--secondary)", color: printMode ? "var(--primary-foreground)" : "var(--foreground)", border: "1px solid var(--border)" }}
          >
            {printMode ? "Standard View" : "📄 Printable Formal View"}
          </button>
          {printMode && (
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              🖨️ Print / Save as PDF
            </button>
          )}
        </div>
      </div>

      {printMode ? (
        /* Formal Printable College Evaluation Report */
        <div className="print-report rounded-xl p-8 border max-w-4xl mx-auto shadow-sm" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="border-b pb-6 mb-6 text-center">
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">College Mini Project Deliverable</span>
            <h2 className="font-display text-2xl font-bold mt-1" style={{ color: "var(--foreground)" }}>
              Credit Card Fraud Detection & Network Anomaly Detection
            </h2>
            <p className="text-xs font-mono mt-1" style={{ color: "var(--muted-foreground)" }}>
              Machine Learning Based Dual Security System · Final Evaluation Report
            </p>
            <p className="text-[11px] font-mono mt-2 opacity-60">
              Generated: {new Date().toLocaleString()} · Active Session Audit
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <h3 className="text-sm font-semibold mb-3 border-b pb-1" style={{ color: "var(--primary)" }}>
                1. Credit Card Fraud Analysis Summary
              </h3>
              <Row label="Active Dataset" value={fraudDatasetName} />
              <Row label="Total Transactions Analyzed" value={fraudTotal.toLocaleString()} />
              <Row label="Legitimate Volume" value={legitCount.toLocaleString()} />
              <Row label="Potentially Fraudulent" value={fraudCount.toLocaleString()} color="#f43f5e" />
              <Row label="Calculated Fraud Ratio" value={`${fraudRate}%`} />
              <Row label="Machine Learning Algorithm" value={fraudMetrics.algorithm} mono={false} />
              <Row label="Model Accuracy" value={`${fraudMetrics.accuracy}%`} />
              <Row label="Model F1-Score" value={`${fraudMetrics.f1}%`} />
              <Row label="Decision Threshold" value={String(config.fraudThreshold)} />
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3 border-b pb-1" style={{ color: "#0ea5e9" }}>
                2. Network Anomaly Detection Summary
              </h3>
              <Row label="Active Dataset" value={networkDatasetName} />
              <Row label="Total Packets/Flows" value={netTotal.toLocaleString()} />
              <Row label="Normal Traffic Profile" value={normalCount.toLocaleString()} />
              <Row label="Suspicious Traffic Volume" value={anomalyCount.toLocaleString()} color="#f59e0b" />
              <Row label="Anomaly Percentage" value={`${anomalyRate}%`} />
              <Row label="Algorithm" value={anomalyMetrics.algorithm} mono={false} />
              <Row label="Contamination Parameter" value={String(config.anomalyContamination)} />
              <Row label="Isolation Estimators" value={String(anomalyMetrics.nEstimators)} />
              <Row label="Learning Paradigm" value="Unsupervised Outlier Isolation" mono={false} />
            </div>
          </div>

          <div className="border-t pt-4 mb-6">
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>
              3. Network Scan Findings (up to 100 flagged records)
            </h3>
            {networkRecords.filter((record) => record.status === "Suspicious Activity").slice(0, 100).length ? (
              <table className="w-full text-[9px] border-collapse">
                <thead><tr><th className="text-left border p-1">Record ID</th><th className="text-left border p-1">Protocol</th><th className="text-left border p-1">Service</th><th className="text-left border p-1">Flag</th><th className="text-left border p-1">Source Bytes</th><th className="text-left border p-1">Destination Bytes</th><th className="text-left border p-1">Anomaly Score</th></tr></thead>
                <tbody>{networkRecords.filter((record) => record.status === "Suspicious Activity").slice(0, 100).map((record) => (
                  <tr key={record.id}><td className="border p-1">{record.id}</td><td className="border p-1">{record.protocol}</td><td className="border p-1">{record.service}</td><td className="border p-1">{record.flag}</td><td className="border p-1">{record.srcBytes}</td><td className="border p-1">{record.dstBytes}</td><td className="border p-1">{record.anomalyScore}</td></tr>
                ))}</tbody>
              </table>
            ) : <p className="text-xs">No suspicious network records in the active scan.</p>}
          </div>

          <div className="border-t pt-4 mb-6">
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>
              4. Fraud Scan Findings (up to 100 flagged transactions)
            </h3>
            {transactions.filter((transaction) => transaction.prediction === "Potentially Fraudulent").slice(0, 100).length ? (
              <table className="w-full text-[9px] border-collapse">
                <thead><tr><th className="text-left border p-1">Transaction ID</th><th className="text-left border p-1">Time</th><th className="text-left border p-1">Amount</th><th className="text-left border p-1">V1</th><th className="text-left border p-1">V14</th><th className="text-left border p-1">V17</th><th className="text-left border p-1">Confidence</th></tr></thead>
                <tbody>{transactions.filter((transaction) => transaction.prediction === "Potentially Fraudulent").slice(0, 100).map((transaction) => (
                  <tr key={transaction.id}><td className="border p-1">{transaction.id}</td><td className="border p-1">{transaction.time}</td><td className="border p-1">{transaction.amount}</td><td className="border p-1">{transaction.v1}</td><td className="border p-1">{transaction.v14}</td><td className="border p-1">{transaction.v17}</td><td className="border p-1">{transaction.confidence}%</td></tr>
                ))}</tbody>
              </table>
            ) : <p className="text-xs">No potentially fraudulent transactions in the active scan.</p>}
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>
              5. Examiner Viva Notes & Methodological Justification
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground mb-2">
              <strong>Class Imbalance:</strong> In credit card fraud, genuine transactions outnumber fraudulent events by &gt;99:1. Reporting 99% accuracy is trivial (a dumb classifier predicting all zeros achieves 99.3%). Thus, <em>Precision, Recall, and F1-Score</em> are the genuine indicators of model viability. <code className="font-mono">class_weight="balanced"</code> was applied to penalize false negatives severely.
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              <strong>Unsupervised Anomaly Isolation:</strong> Network logs typically lack labeled ground truth during zero-day intrusions. Isolation Forest creates tree structures that partition unusual vectors in dramatically shorter branch paths without requiring prior classification tags.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span>Project Mentor Verification: _______________</span>
            <span>Internal Viva Examiner: _______________</span>
          </div>
        </div>
      ) : (
        /* Standard View */
        <>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Fraud Report Section */}
            <Section title="Credit Card Fraud Detection Report">
              <div className="flex flex-col gap-1">
                <Row label="Active Dataset" value={fraudDatasetName} />
                <Row label="Total Transactions" value={fraudTotal.toLocaleString()} />
                <Row label="Legitimate Transactions" value={legitCount.toLocaleString()} />
                <Row label="Potentially Fraudulent" value={fraudCount.toLocaleString()} color="#f43f5e" />
                <Row label="Fraud Rate" value={`${fraudRate}%`} color="var(--primary)" />
                <Row label="Algorithm" value={fraudMetrics.algorithm} mono={false} />
                <Row label="Model Version" value={fraudMetrics.modelVersion} />
                <Row label="Training Date" value={fraudMetrics.trainingDate} />
                <Row label="Training Set Size" value={fraudMetrics.trainingSize.toLocaleString()} />
              </div>
              <button
                onClick={downloadFraudReport}
                className="mt-4 px-4 py-2 rounded-lg text-xs font-mono w-full transition-colors cursor-pointer flex items-center justify-center gap-2"
                style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}
              >
                <span>↓</span> Download Fraud Report CSV
              </button>
            </Section>

            {/* Network Report Section */}
            <Section title="Network Anomaly Detection Report">
              <div className="flex flex-col gap-1">
                <Row label="Active Dataset" value={networkDatasetName} />
                <Row label="Total Network Records" value={netTotal.toLocaleString()} />
                <Row label="Normal Activity" value={normalCount.toLocaleString()} />
                <Row label="Suspicious Activity" value={anomalyCount.toLocaleString()} color="#f59e0b" />
                <Row label="Anomaly Rate" value={`${anomalyRate}%`} color="#a78bfa" />
                <Row label="Algorithm" value={anomalyMetrics.algorithm} mono={false} />
                <Row label="Model Version" value={anomalyMetrics.modelVersion} />
                <Row label="Training Date" value={anomalyMetrics.trainingDate} />
                <Row label="Contamination Factor" value={String(config.anomalyContamination)} />
              </div>
              <div className="mt-3 px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)", color: "var(--muted-foreground)" }}>
                Note: Supervised metrics (accuracy/precision/recall) cannot be calculated for Isolation Forest without labeled ground truth. Anomaly rate and score distribution are reported instead.
              </div>
              <button
                onClick={downloadNetReport}
                className="mt-3 px-4 py-2 rounded-lg text-xs font-mono w-full transition-colors cursor-pointer flex items-center justify-center gap-2"
                style={{ background: "rgba(14,165,233,0.1)", color: "#0ea5e9", border: "1px solid rgba(14,165,233,0.25)" }}
              >
                <span>↓</span> Download Network Report CSV
              </button>
            </Section>
          </div>

          {/* Model Metrics & Confusion Matrix */}
          <Section title="Fraud Model Performance — Confusion Matrix & Evaluation">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <div className="flex flex-col gap-1">
                  <Row label="Accuracy" value={`${fraudMetrics.accuracy}%`} color="#10b981" />
                  <Row label="Precision" value={`${fraudMetrics.precision}%`} color="#0ea5e9" />
                  <Row label="Recall (Sensitivity)" value={`${fraudMetrics.recall}%`} color="var(--primary)" />
                  <Row label="F1-Score" value={`${fraudMetrics.f1}%`} color="#a78bfa" />
                  <Row label="n_estimators" value={String(fraudMetrics.nEstimators)} />
                </div>
                <div className="mt-4 p-3 rounded-lg text-xs leading-relaxed" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", color: "var(--muted-foreground)" }}>
                  Accuracy alone is misleading for fraud detection — only ~0.6% of transactions are fraud. Precision, Recall, and F1 are the primary metrics. <code className="font-mono">class_weight="balanced"</code> was used to mitigate the class imbalance problem.
                </div>
              </div>

              <div>
                <p className="text-xs mb-3 font-semibold" style={{ color: "var(--muted-foreground)" }}>
                  Confusion Matrix — 20% Holdout Test Set (57,211 instances)
                </p>
                <div className="grid grid-cols-2 gap-2 max-w-sm">
                  {[
                    { label: "TN", value: tn, color: "#10b981", desc: "True Negative (Legitimate)" },
                    { label: "FP", value: fp, color: "#f59e0b", desc: "False Positive (False Alarm)" },
                    { label: "FN", value: fn, color: "#f43f5e", desc: "False Negative (Missed Fraud)" },
                    { label: "TP", value: tp, color: "#10b981", desc: "True Positive (Detected Fraud)" },
                  ].map(({ label, value, color, desc }) => (
                    <div key={label} className="rounded-lg p-3 text-center border" style={{ background: `${color}10`, borderColor: `${color}30` }}>
                      <p className="font-mono text-xl font-bold" style={{ color }}>{value.toLocaleString()}</p>
                      <p className="text-[10px] font-mono mt-0.5 font-semibold" style={{ color }}>{label}</p>
                      <p className="text-[9px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Report Audit Trail */}
          <Section title="Session Report Generation & Scan Audit Trail">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--secondary)" }}>
                    {["Report ID", "Report Title", "Type", "Generated Time", "Records", "Flagged Count", "Detection Rate"].map((h) => (
                      <th key={h} className="text-left px-4 py-2.5 font-mono uppercase tracking-wider text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportAudits.map((a, i) => (
                    <tr key={a.id} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "rgba(148,163,184,0.02)" }}>
                      <td className="px-4 py-2.5 font-mono font-medium" style={{ color: "var(--muted-foreground)" }}>{a.id}</td>
                      <td className="px-4 py-2.5 font-medium" style={{ color: "var(--foreground)" }}>{a.title}</td>
                      <td className="px-4 py-2.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{
                          background: a.type === "Fraud Detection" ? "rgba(16,185,129,0.1)" : "rgba(14,165,233,0.1)",
                          color: a.type === "Fraud Detection" ? "#10b981" : "#0ea5e9",
                        }}>
                          {a.type}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono" style={{ color: "var(--muted-foreground)" }}>{a.generatedAt}</td>
                      <td className="px-4 py-2.5 font-mono" style={{ color: "var(--foreground)" }}>{a.totalRecords.toLocaleString()}</td>
                      <td className="px-4 py-2.5 font-mono font-semibold" style={{ color: "#f43f5e" }}>{a.flaggedCount}</td>
                      <td className="px-4 py-2.5 font-mono" style={{ color: "var(--primary)" }}>{a.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </>
      )}
    </div>
  );
}
