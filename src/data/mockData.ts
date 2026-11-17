export type Transaction = {
  id: string;
  time: number;
  amount: number;
  prediction: "Legitimate" | "Potentially Fraudulent";
  confidence: number;
  v1: number;
  v14: number;
  v17: number;
};

export type NetworkRecord = {
  id: string;
  srcBytes: number;
  dstBytes: number;
  duration: number;
  protocol: string;
  service: string;
  flag: string;
  status: "Normal Activity" | "Suspicious Activity";
  anomalyScore: number;
};

function seededRandom(seed: number) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateTransactions(count = 200): Transaction[] {
  const txns: Transaction[] = [];
  for (let i = 0; i < count; i++) {
    const r = seededRandom(i * 7 + 13);
    const isFraud = r < 0.08;
    txns.push({
      id: `TXN-${String(i + 1).padStart(5, "0")}`,
      time: Math.floor(seededRandom(i * 3) * 172800),
      amount: isFraud
        ? +(seededRandom(i * 5 + 1) * 3000 + 500).toFixed(2)
        : +(seededRandom(i * 5 + 1) * 200 + 1).toFixed(2),
      prediction: isFraud ? "Potentially Fraudulent" : "Legitimate",
      confidence: isFraud
        ? +(seededRandom(i * 11) * 15 + 82).toFixed(1)
        : +(seededRandom(i * 11) * 8 + 91).toFixed(1),
      v1: +(seededRandom(i * 2 + 1) * 6 - 3).toFixed(4),
      v14: +(seededRandom(i * 2 + 2) * 6 - 3).toFixed(4),
      v17: +(seededRandom(i * 2 + 3) * 6 - 3).toFixed(4),
    });
  }
  return txns;
}

export function generateNetworkRecords(count = 150): NetworkRecord[] {
  const protocols = ["tcp", "udp", "icmp"];
  const services = ["http", "ftp", "ssh", "smtp", "dns", "telnet", "pop3"];
  const flags = ["SF", "S0", "REJ", "RSTO", "SH"];
  const records: NetworkRecord[] = [];
  for (let i = 0; i < count; i++) {
    const r = seededRandom(i * 9 + 7);
    const isAnomaly = r < 0.12;
    records.push({
      id: `NET-${String(i + 1).padStart(5, "0")}`,
      srcBytes: isAnomaly
        ? Math.floor(seededRandom(i * 4 + 1) * 500000 + 100000)
        : Math.floor(seededRandom(i * 4 + 1) * 5000),
      dstBytes: Math.floor(seededRandom(i * 4 + 2) * 10000),
      duration: +(seededRandom(i * 4 + 3) * 300).toFixed(2),
      protocol: protocols[Math.floor(seededRandom(i * 6) * protocols.length)],
      service: services[Math.floor(seededRandom(i * 6 + 1) * services.length)],
      flag: isAnomaly
        ? flags[Math.floor(seededRandom(i * 6 + 2) * 2) + 1]
        : "SF",
      status: isAnomaly ? "Suspicious Activity" : "Normal Activity",
      anomalyScore: isAnomaly
        ? +(seededRandom(i * 13) * 0.3 + 0.65).toFixed(3)
        : +(seededRandom(i * 13) * 0.25).toFixed(3),
    });
  }
  return records;
}

export const FRAUD_METRICS = {
  accuracy: 99.3,
  precision: 94.7,
  recall: 91.2,
  f1: 92.9,
  confusionMatrix: [[56820, 42], [31, 318]],
  modelVersion: "v2.1.0",
  trainingDate: "2025-08-14",
  algorithm: "Random Forest Classifier",
  nEstimators: 200,
  trainingSize: 227845,
};

export const ANOMALY_METRICS = {
  contamination: 0.08,
  totalRecords: 494021,
  normalCount: 454019,
  anomalyCount: 40002,
  modelVersion: "v1.3.0",
  trainingDate: "2025-08-14",
  algorithm: "Isolation Forest",
  nEstimators: 100,
};
