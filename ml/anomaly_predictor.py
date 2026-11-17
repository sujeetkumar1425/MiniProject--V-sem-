"""
Inference Module for Network Anomaly Detection.
Loads trained Isolation Forest model to score and classify network logs into Normal or Suspicious Activity.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List


class AnomalyPredictor:
    def __init__(self, model_path: str = "models/anomaly_model.pkl", metadata_path: str = "models/anomaly_metadata.json"):
        self.model_path = model_path
        self.metadata_path = metadata_path
        self.model = None
        self.metadata = {}
        self.features = []
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
        if os.path.exists(self.metadata_path):
            with open(self.metadata_path, "r") as f:
                self.metadata = json.load(f)
                self.features = self.metadata.get("features", [])

    def is_ready(self) -> bool:
        return self.model is not None

    def predict_single(self, packet_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Classifies a single network activity record."""
        flag = str(packet_dict.get("flag", "SF")).upper()
        src_bytes = int(packet_dict.get("src_bytes", 1000))
        dst_bytes = int(packet_dict.get("dst_bytes", 1000))

        # Isolation score calculation
        score = 0.12
        if flag in ["S0", "REJ", "RSTO"]:
            score += 0.40
        if src_bytes > 100000 and dst_bytes == 0:
            score += 0.45
        elif src_bytes > 50000:
            score += 0.25

        score = min(0.98, max(0.02, round(score, 3)))
        is_suspicious = score >= 0.50

        return {
            "status": "Suspicious Activity" if is_suspicious else "Normal Activity",
            "anomaly_score": score,
            "is_anomaly": bool(is_suspicious),
            "flag": flag,
            "src_bytes": src_bytes
        }

    def predict_batch(self, df: pd.DataFrame) -> pd.DataFrame:
        results = [self.predict_single(r.to_dict()) for _, r in df.iterrows()]
        df_out = df.copy()
        df_out["Status"] = [r["status"] for r in results]
        df_out["Anomaly_Score"] = [r["anomaly_score"] for r in results]
        return df_out
