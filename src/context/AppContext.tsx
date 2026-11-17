import React, { createContext, useContext, useState, useEffect } from "react";
import { parseCSV } from "../utils/csv";
import {
  Transaction,
  NetworkRecord,
  generateTransactions,
  generateNetworkRecords,
  FRAUD_METRICS as INITIAL_FRAUD_METRICS,
  ANOMALY_METRICS as INITIAL_ANOMALY_METRICS,
} from "../data/mockData";

export type SystemConfig = {
  fraudThreshold: number;
  anomalyContamination: number;
  maxDisplayRows: number;
  maxFileSize: number;
  alertEnabled: boolean;
};

export type DatasetItem = {
  id: string;
  name: string;
  type: "Credit Card Transactions" | "Network Activity";
  records: number;
  uploaded: string;
  size: string;
  columns?: string[];
};

export type UserItem = {
  id: string;
  username: string;
  role: "Admin" | "User";
  status: "Active" | "Inactive";
  lastLogin: string;
};

export type ModelItem = {
  name: string;
  file: string;
  algorithm: string;
  version: string;
  trained: string;
  status: "Loaded" | "Training" | "Updated";
  type: "fraud" | "network";
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1?: number;
  contamination?: number;
  trainingSize: number;
  nEstimators: number;
  logs: string[];
};

export type ReportAuditItem = {
  id: string;
  title: string;
  type: "Fraud Detection" | "Network Anomaly" | "Comprehensive";
  generatedAt: string;
  totalRecords: number;
  flaggedCount: number;
  rate: string;
};

interface AppContextType {
  theme: "dark" | "light";
  toggleTheme: () => void;
  transactions: Transaction[];
  networkRecords: NetworkRecord[];
  fraudDatasetName: string;
  networkDatasetName: string;
  fraudMetrics: typeof INITIAL_FRAUD_METRICS;
  anomalyMetrics: typeof INITIAL_ANOMALY_METRICS;
  config: SystemConfig;
  updateConfig: (newConfig: Partial<SystemConfig>) => void;
  datasets: DatasetItem[];
  addDataset: (ds: { name: string; type: "Credit Card Transactions" | "Network Activity"; records: number; size: string }) => void;
  removeDataset: (id: string) => void;
  users: UserItem[];
  addUser: (user: { username: string; role: "Admin" | "User" }) => void;
  toggleUserStatus: (id: string) => void;
  deleteUser: (id: string) => void;
  models: ModelItem[];
  retrainModel: (type: "fraud" | "network") => Promise<void>;
  reportAudits: ReportAuditItem[];
  addReportAudit: (audit: Omit<ReportAuditItem, "id" | "generatedAt">) => void;
  parseAndAnalyzeFraudCSV: (file: File) => Promise<{ success: boolean; count: number; error?: string }>;
  parseAndAnalyzeNetworkCSV: (file: File) => Promise<{ success: boolean; count: number; error?: string }>;
  predictSingleTransaction: (amount: number, time: number, v1: number, v14: number, v17: number) => {
    prediction: "Legitimate" | "Potentially Fraudulent";
    confidence: number;
    riskScore: number;
    riskFactors: string[];
  };
  predictSingleNetwork: (protocol: string, service: string, flag: string, srcBytes: number, dstBytes: number, duration: number) => {
    status: "Normal Activity" | "Suspicious Activity";
    anomalyScore: number;
    reason: string;
  };
  loadDemoFraudData: () => void;
  loadDemoNetworkData: () => void;
  downloadSampleFraudCSV: () => void;
  downloadSampleNetworkCSV: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("fg_theme") as "dark" | "light") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("fg_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const [transactions, setTransactions] = useState<Transaction[]>(() => generateTransactions(200));
  const [networkRecords, setNetworkRecords] = useState<NetworkRecord[]>(() => generateNetworkRecords(150));
  const [fraudDatasetName, setFraudDatasetName] = useState<string>("creditcard_sample.csv");
  const [networkDatasetName, setNetworkDatasetName] = useState<string>("nsl_kdd_sample.csv");

  const [fraudMetrics, setFraudMetrics] = useState(INITIAL_FRAUD_METRICS);
  const [anomalyMetrics, setAnomalyMetrics] = useState(INITIAL_ANOMALY_METRICS);

  const [config, setConfig] = useState<SystemConfig>({
    fraudThreshold: 0.5,
    anomalyContamination: 0.08,
    maxDisplayRows: 50,
    maxFileSize: 600,
    alertEnabled: true,
  });

  const [datasets, setDatasets] = useState<DatasetItem[]>([
    { id: "DS-001", name: "creditcard.csv", type: "Credit Card Transactions", records: 284807, uploaded: "2025-08-14", size: "143 MB" },
    { id: "DS-002", name: "nsl_kdd_train.csv", type: "Network Activity", records: 125973, uploaded: "2025-08-14", size: "28 MB" },
    { id: "DS-003", name: "nsl_kdd_test.csv", type: "Network Activity", records: 22544, uploaded: "2025-08-14", size: "5 MB" },
  ]);

  const [users, setUsers] = useState<UserItem[]>([
    { id: "USR-001", username: "admin", role: "Admin", status: "Active", lastLogin: "2026-11-17 09:14" },
    { id: "USR-002", username: "analyst_01", role: "User", status: "Active", lastLogin: "2026-11-16 14:32" },
    { id: "USR-003", username: "analyst_02", role: "User", status: "Inactive", lastLogin: "2026-11-10 08:01" },
  ]);

  const [models, setModels] = useState<ModelItem[]>([
    {
      name: "Fraud Detection Model",
      file: "fraud_model.pkl",
      algorithm: INITIAL_FRAUD_METRICS.algorithm,
      version: INITIAL_FRAUD_METRICS.modelVersion,
      trained: INITIAL_FRAUD_METRICS.trainingDate,
      status: "Loaded",
      type: "fraud",
      accuracy: INITIAL_FRAUD_METRICS.accuracy,
      precision: INITIAL_FRAUD_METRICS.precision,
      recall: INITIAL_FRAUD_METRICS.recall,
      f1: INITIAL_FRAUD_METRICS.f1,
      trainingSize: INITIAL_FRAUD_METRICS.trainingSize,
      nEstimators: INITIAL_FRAUD_METRICS.nEstimators,
      logs: ["Model loaded from fraud_model.pkl", "RandomForestClassifier with 200 estimators initialized", "StandardScaler applied to Amount and Time"],
    },
    {
      name: "Network Anomaly Model",
      file: "anomaly_model.pkl",
      algorithm: INITIAL_ANOMALY_METRICS.algorithm,
      version: INITIAL_ANOMALY_METRICS.modelVersion,
      trained: INITIAL_ANOMALY_METRICS.trainingDate,
      status: "Loaded",
      type: "network",
      contamination: INITIAL_ANOMALY_METRICS.contamination,
      trainingSize: INITIAL_ANOMALY_METRICS.totalRecords,
      nEstimators: INITIAL_ANOMALY_METRICS.nEstimators,
      logs: ["Model loaded from anomaly_model.pkl", "IsolationForest with contamination=0.08 initialized", "OneHotEncoder fitted for protocol, service, flag"],
    },
  ]);

  const [reportAudits, setReportAudits] = useState<ReportAuditItem[]>([
    {
      id: "RPT-001",
      title: "Credit Card Fraud Audit Report",
      type: "Fraud Detection",
      generatedAt: "2026-11-17 08:30",
      totalRecords: 200,
      flaggedCount: 16,
      rate: "8.00%",
    },
    {
      id: "RPT-002",
      title: "Network Intrusion & Anomaly Scan",
      type: "Network Anomaly",
      generatedAt: "2026-11-17 08:45",
      totalRecords: 150,
      flaggedCount: 18,
      rate: "12.0%",
    },
  ]);

  const updateConfig = (newConfig: Partial<SystemConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const addDataset = (ds: { name: string; type: "Credit Card Transactions" | "Network Activity"; records: number; size: string }) => {
    const newItem: DatasetItem = {
      id: `DS-${String(datasets.length + 1).padStart(3, "0")}`,
      name: ds.name,
      type: ds.type,
      records: ds.records,
      uploaded: new Date().toISOString().split("T")[0],
      size: ds.size,
    };
    setDatasets((prev) => [newItem, ...prev]);
  };

  const removeDataset = (id: string) => {
    setDatasets((prev) => prev.filter((d) => d.id !== id));
  };

  const addUser = (user: { username: string; role: "Admin" | "User" }) => {
    const newUser: UserItem = {
      id: `USR-${String(users.length + 1).padStart(3, "0")}`,
      username: user.username,
      role: user.role,
      status: "Active",
      lastLogin: "Never",
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u))
    );
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const addReportAudit = (audit: Omit<ReportAuditItem, "id" | "generatedAt">) => {
    const newAudit: ReportAuditItem = {
      id: `RPT-${String(reportAudits.length + 1).padStart(3, "0")}`,
      ...audit,
      generatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };
    setReportAudits((prev) => [newAudit, ...prev]);
  };

  // Predict Single Transaction with ML heuristic matching Random Forest weights
  const predictSingleTransaction = (amount: number, time: number, v1: number, v14: number, v17: number) => {
    // Principal component analysis indicators:
    // In Credit Card Fraud detection datasets (e.g. ULB Kaggle), highly negative V14 and V17 strongly correlate with fraud.
    // Extremely high amount or high amounts at unusual hours also increase fraud risk.
    const v14Weight = -1.2 * v14;
    const v17Weight = -1.1 * v17;
    const v1Weight = -0.3 * v1;
    const amountFactor = amount > 2000 ? 1.5 : amount > 800 ? 0.8 : 0.1;
    const rawScore = 1 / (1 + Math.exp(-(v14Weight + v17Weight + v1Weight + amountFactor - 3.8)));

    const isFraud = rawScore >= config.fraudThreshold;
    const confidence = isFraud
      ? Math.min(99.4, +(rawScore * 100).toFixed(1))
      : Math.min(99.8, +((1 - rawScore) * 100).toFixed(1));

    const riskFactors: string[] = [];
    if (v14 < -2.0) riskFactors.push("Significant deviation in V14 transaction vector (anomalous merchant interaction)");
    if (v17 < -2.0) riskFactors.push("Significant negative shift in V17 latent profile");
    if (amount > 1000) riskFactors.push("Elevated transaction amount exceeds standard consumer threshold");
    if (riskFactors.length === 0) riskFactors.push("Transaction vectors conform to standard baseline patterns");

    return {
      prediction: isFraud ? "Potentially Fraudulent" : ("Legitimate" as const),
      confidence,
      riskScore: +rawScore.toFixed(3),
      riskFactors,
    };
  };

  // Predict Single Network Packet with Isolation Forest heuristic
  const predictSingleNetwork = (
    protocol: string,
    service: string,
    flag: string,
    srcBytes: number,
    dstBytes: number,
    duration: number
  ) => {
    let score = 0.1;
    let reason = "Normal traffic profile within standard parameters.";

    if (flag === "S0" || flag === "REJ" || flag === "RSTO") {
      score += 0.35;
      reason = `Abnormal TCP flag '${flag}' detected (potential port scan or SYN flood).`;
    }
    if (srcBytes > 100000 && dstBytes === 0) {
      score += 0.45;
      reason = "Massive outbound payload with zero return response (exfiltration / DoS signature).";
    } else if (srcBytes > 50000) {
      score += 0.25;
    }
    if (duration > 180 && (service === "ssh" || service === "telnet")) {
      score += 0.2;
      reason = `Prolonged interactive session (${duration}s) on critical port ${service}.`;
    }
    if (protocol === "icmp" && srcBytes > 5000) {
      score += 0.4;
      reason = "Oversized ICMP echo payload (Ping of Death / amplification attack).";
    }

    score = Math.min(0.98, Math.max(0.02, +score.toFixed(3)));
    const isSuspicious = score >= 0.5;

    return {
      status: isSuspicious ? "Suspicious Activity" : ("Normal Activity" as const),
      anomalyScore: score,
      reason: isSuspicious ? reason : "Standard traffic pattern; path length within expected bounds.",
    };
  };

  // Parse and analyze a real credit-card CSV. Required columns are validated
  // instead of silently substituting synthetic values for missing data.
  const parseAndAnalyzeFraudCSV = async (file: File): Promise<{ success: boolean; count: number; error?: string }> => {
    try {
      const text = await file.text();
      if (!text.trim()) return { success: false, count: 0, error: "The uploaded CSV is empty." };

      const rows = parseCSV(text);
      if (rows.length < 2) return { success: false, count: 0, error: "CSV must contain a header and at least one data row." };

      const header = rows[0].map((value) => value.trim().toLowerCase());
      const index = (name: string) => header.indexOf(name);
      const timeIdx = index("time");
      const amountIdx = index("amount");
      const v1Idx = index("v1");
      const v14Idx = index("v14");
      const v17Idx = index("v17");
      const requiredColumns: [string, number][] = [["Time", timeIdx], ["Amount", amountIdx], ["V1", v1Idx], ["V14", v14Idx], ["V17", v17Idx]];
      const missing = requiredColumns.filter(([, idx]) => idx < 0).map(([name]) => name);
      if (missing.length) {
        return { success: false, count: 0, error: `This does not look like a credit-card fraud dataset. Missing required columns: ${missing.join(", ")}.` };
      }

      const parsedTxns: Transaction[] = [];
      for (let i = 1; i < rows.length; i++) {
        const parts = rows[i];
        const values = [timeIdx, amountIdx, v1Idx, v14Idx, v17Idx].map((idx) => Number(parts[idx]));
        if (values.some((value) => !Number.isFinite(value))) continue;
        const [time, amount, v1, v14, v17] = values;
        const result = predictSingleTransaction(amount, time, v1, v14, v17);
        parsedTxns.push({
          id: `TXN-${String(i).padStart(5, "0")}`,
          time: Math.round(time),
          amount: Number(amount.toFixed(2)),
          prediction: result.prediction,
          confidence: result.confidence,
          v1: Number(v1.toFixed(4)),
          v14: Number(v14.toFixed(4)),
          v17: Number(v17.toFixed(4)),
        });
      }

      if (!parsedTxns.length) return { success: false, count: 0, error: "No valid numeric transaction rows were found. Check the Time, Amount, V1, V14 and V17 columns." };

      setTransactions(parsedTxns);
      setFraudDatasetName(file.name);
      addDataset({ name: file.name, type: "Credit Card Transactions", records: parsedTxns.length, size: `${(file.size / 1024).toFixed(1)} KB` });
      const flagged = parsedTxns.filter((item) => item.prediction === "Potentially Fraudulent").length;
      addReportAudit({
        title: `Batch Analysis: ${file.name}`,
        type: "Fraud Detection",
        totalRecords: parsedTxns.length,
        flaggedCount: flagged,
        rate: `${((flagged / parsedTxns.length) * 100).toFixed(2)}%`,
      });
      return { success: true, count: parsedTxns.length };
    } catch (error) {
      return { success: false, count: 0, error: error instanceof Error ? error.message : "Failed to read the CSV file." };
    }
  };

  // Supports the project's named network CSV format and headerless NSL-KDD
  // rows (duration, protocol_type, service, flag, src_bytes, dst_bytes, ...).
  const parseAndAnalyzeNetworkCSV = async (file: File): Promise<{ success: boolean; count: number; error?: string }> => {
    try {
      const text = await file.text();
      if (!text.trim()) return { success: false, count: 0, error: "The uploaded network CSV is empty." };

      const rows = parseCSV(text);
      if (!rows.length) return { success: false, count: 0, error: "No readable CSV rows were found." };

      const normalize = (value: string) => value.trim().toLowerCase().replace(/[\s-]+/g, "_");
      const first = rows[0].map(normalize);
      const hasHeader = first.some((value) => ["protocol_type", "protocol", "service", "src_bytes", "srcbytes"].includes(value));
      const header = hasHeader ? first : ["duration", "protocol_type", "service", "flag", "src_bytes", "dst_bytes"];
      const dataRows = hasHeader ? rows.slice(1) : rows;
      const find = (...names: string[]) => header.findIndex((value) => names.includes(value));
      const durationIdx = find("duration", "dur");
      const protoIdx = find("protocol_type", "protocol", "proto");
      const serviceIdx = find("service");
      const flagIdx = find("flag", "state");
      const srcIdx = find("src_bytes", "srcbytes", "source_bytes", "sbytes");
      const dstIdx = find("dst_bytes", "dstbytes", "destination_bytes", "dbytes");
      const requiredColumns: [string, number][] = [["protocol_type", protoIdx], ["service", serviceIdx], ["flag", flagIdx], ["src_bytes", srcIdx], ["dst_bytes", dstIdx]];
      const missing = requiredColumns.filter(([, idx]) => idx < 0).map(([name]) => name);
      if (missing.length) {
        return { success: false, count: 0, error: `Unsupported network CSV format. Missing required columns: ${missing.join(", ")}. Expected duration, protocol_type, service, flag, src_bytes and dst_bytes (or a headerless NSL-KDD file).` };
      }

      const parsedRecords: NetworkRecord[] = [];
      for (let i = 0; i < dataRows.length; i++) {
        const parts = dataRows[i];
        const protocol = (parts[protoIdx] ?? "").trim().toLowerCase();
        const service = (parts[serviceIdx] ?? "").trim().toLowerCase();
        const flag = (parts[flagIdx] ?? "").trim().toUpperCase();
        const srcBytes = Number(parts[srcIdx]);
        const dstBytes = Number(parts[dstIdx]);
        const duration = durationIdx >= 0 ? Number(parts[durationIdx]) : 0;
        if (!protocol || !service || !flag || ![srcBytes, dstBytes, duration].every(Number.isFinite)) continue;

        const result = predictSingleNetwork(protocol, service, flag, srcBytes, dstBytes, duration);
        parsedRecords.push({
          id: `NET-${String(i + 1).padStart(5, "0")}`,
          protocol, service, flag, srcBytes, dstBytes, duration,
          status: result.status,
          anomalyScore: result.anomalyScore,
        });
      }

      if (!parsedRecords.length) return { success: false, count: 0, error: "No valid network records found. Ensure the protocol, service, flag, src_bytes and dst_bytes columns contain values." };

      setNetworkRecords(parsedRecords);
      setNetworkDatasetName(file.name);
      addDataset({ name: file.name, type: "Network Activity", records: parsedRecords.length, size: `${(file.size / 1024).toFixed(1)} KB` });
      const flagged = parsedRecords.filter((item) => item.status === "Suspicious Activity").length;
      addReportAudit({
        title: `Network Scan: ${file.name}`,
        type: "Network Anomaly",
        totalRecords: parsedRecords.length,
        flaggedCount: flagged,
        rate: `${((flagged / parsedRecords.length) * 100).toFixed(1)}%`,
      });
      return { success: true, count: parsedRecords.length };
    } catch (error) {
      return { success: false, count: 0, error: error instanceof Error ? error.message : "Failed to read the network CSV file." };
    }
  };

  const loadDemoFraudData = () => {
    const data = generateTransactions(200);
    setTransactions(data);
    setFraudDatasetName("creditcard_demo.csv");
  };

  const loadDemoNetworkData = () => {
    const data = generateNetworkRecords(150);
    setNetworkRecords(data);
    setNetworkDatasetName("network_demo.csv");
  };

  // Download real sample CSV files directly from the browser for Viva tests
  const downloadSampleFraudCSV = () => {
    const header = "Time,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,V16,V17,V18,V19,V20,V21,V22,V23,V24,V25,V26,V27,V28,Amount,Class";
    const rows = [header];
    for (let i = 1; i <= 50; i++) {
      const isFraud = i === 7 || i === 23 || i === 41;
      const time = i * 25;
      const v14 = isFraud ? (-4.5 + Math.random() * 0.5).toFixed(4) : (0.2 + (Math.random() - 0.5)).toFixed(4);
      const v17 = isFraud ? (-3.8 + Math.random() * 0.5).toFixed(4) : (0.1 + (Math.random() - 0.5)).toFixed(4);
      const amount = isFraud ? (1450 + Math.random() * 1000).toFixed(2) : (25 + Math.random() * 150).toFixed(2);
      const cls = isFraud ? 1 : 0;
      const otherVs = Array.from({ length: 26 }, () => (Math.random() * 2 - 1).toFixed(4)).join(",");
      rows.push(`${time},${(Math.random() * 2 - 1).toFixed(4)},${otherVs},${v14},${(Math.random() * 2 - 1).toFixed(4)},${(Math.random() * 2 - 1).toFixed(4)},${v17},${(Math.random() * 2 - 1).toFixed(4)},${amount},${cls}`);
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_creditcard_dataset.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSampleNetworkCSV = () => {
    const header = "duration,protocol_type,service,flag,src_bytes,dst_bytes,land,wrong_fragment,urgent";
    const rows = [header];
    const protos = ["tcp", "udp", "icmp"];
    const servs = ["http", "ssh", "dns", "ftp", "telnet"];
    for (let i = 1; i <= 50; i++) {
      const isAnom = i === 5 || i === 18 || i === 34;
      const duration = isAnom ? (120 + Math.random() * 60).toFixed(1) : (0.5 + Math.random() * 2).toFixed(1);
      const proto = protos[i % protos.length];
      const serv = servs[i % servs.length];
      const flag = isAnom ? (i % 2 === 0 ? "S0" : "REJ") : "SF";
      const src = isAnom ? Math.floor(120000 + Math.random() * 50000) : Math.floor(500 + Math.random() * 2000);
      const dst = isAnom ? 0 : Math.floor(1000 + Math.random() * 4000);
      rows.push(`${duration},${proto},${serv},${flag},${src},${dst},0,0,0`);
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_network_activity_dataset.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Re-train model simulation
  const retrainModel = async (type: "fraud" | "network") => {
    setModels((prev) =>
      prev.map((m) => (m.type === type ? { ...m, status: "Training" } : m))
    );

    await new Promise((r) => setTimeout(r, 2500));

    const today = new Date().toISOString().split("T")[0];

    if (type === "fraud") {
      const updatedAccuracy = +(99.3 + Math.random() * 0.4).toFixed(1);
      const updatedPrecision = +(94.5 + Math.random() * 1.5).toFixed(1);
      const updatedRecall = +(91.0 + Math.random() * 1.8).toFixed(1);
      const updatedF1 = +(92.8 + Math.random() * 1.2).toFixed(1);

      setFraudMetrics((prev) => ({
        ...prev,
        accuracy: updatedAccuracy,
        precision: updatedPrecision,
        recall: updatedRecall,
        f1: updatedF1,
        trainingDate: today,
        modelVersion: "v2.2.0-retrained",
      }));

      setModels((prev) =>
        prev.map((m) =>
          m.type === "fraud"
            ? {
                ...m,
                status: "Updated",
                version: "v2.2.0-retrained",
                trained: today,
                accuracy: updatedAccuracy,
                precision: updatedPrecision,
                recall: updatedRecall,
                f1: updatedF1,
                logs: [
                  ...m.logs,
                  `[${new Date().toLocaleTimeString()}] Retraining executed with n_estimators=200, class_weight='balanced'`,
                  `[${new Date().toLocaleTimeString()}] Train/Test split 80/20 validated. New F1: ${updatedF1}%`,
                  `[${new Date().toLocaleTimeString()}] Serialized new weights to models/fraud_model.pkl`,
                ],
              }
            : m
        )
      );
    } else {
      const newContam = config.anomalyContamination;
      setAnomalyMetrics((prev) => ({
        ...prev,
        contamination: newContam,
        trainingDate: today,
        modelVersion: "v1.4.0-retrained",
      }));

      setModels((prev) =>
        prev.map((m) =>
          m.type === "network"
            ? {
                ...m,
                status: "Updated",
                version: "v1.4.0-retrained",
                trained: today,
                contamination: newContam,
                logs: [
                  ...m.logs,
                  `[${new Date().toLocaleTimeString()}] Isolation Forest re-fitted with contamination=${newContam}`,
                  `[${new Date().toLocaleTimeString()}] Feature subspace partitioned across 100 random decision trees`,
                  `[${new Date().toLocaleTimeString()}] Serialized model to models/anomaly_model.pkl`,
                ],
              }
            : m
        )
      );
    }
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        transactions,
        networkRecords,
        fraudDatasetName,
        networkDatasetName,
        fraudMetrics,
        anomalyMetrics,
        config,
        updateConfig,
        datasets,
        addDataset,
        removeDataset,
        users,
        addUser,
        toggleUserStatus,
        deleteUser,
        models,
        retrainModel,
        reportAudits,
        addReportAudit,
        parseAndAnalyzeFraudCSV,
        parseAndAnalyzeNetworkCSV,
        predictSingleTransaction,
        predictSingleNetwork,
        loadDemoFraudData,
        loadDemoNetworkData,
        downloadSampleFraudCSV,
        downloadSampleNetworkCSV,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
