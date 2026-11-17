"""
Model Training Script for Network Anomaly Detection.
Algorithm: Isolation Forest (Unsupervised).
Usage: python ml/train_anomaly_model.py [dataset_path]
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.ensemble import IsolationForest

# Ensure project root is in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from preprocessing.network_preprocessing import NetworkPreprocessor


def train_anomaly_model(dataset_path: str = "data/network_sample.csv"):
    print("=" * 65)
    print("  NETWORK ANOMALY DETECTION — MODEL TRAINING PIPELINE")
    print("=" * 65)

    if not os.path.exists(dataset_path):
        print(f"[!] Dataset not found at '{dataset_path}'.")
        print("[*] Generating synthetic sample network dataset for demonstration...")
        from data.generate_sample_data import generate_sample_network_csv
        generate_sample_network_csv(dataset_path)

    print(f"[*] Step 1: Loading network dataset from '{dataset_path}'...")
    df = pd.read_csv(dataset_path)
    print(f"    Raw records: {len(df):,}, Attributes: {len(df.columns)}")

    print("[*] Step 2: Data preprocessing & one-hot encoding...")
    preprocessor = NetworkPreprocessor(scaler_path="models/anomaly_scaler.pkl")
    X, feature_cols = preprocessor.fit_transform(df)
    print(f"    Encoded feature matrix shape: {X.shape}")

    print("[*] Step 3: Fitting Isolation Forest (n_estimators=100, contamination=0.08)...")
    iso_forest = IsolationForest(
        n_estimators=100,
        contamination=0.08,
        random_state=42,
        n_jobs=-1
    )
    iso_forest.fit(X)
    print("    Isolation Forest model successfully trained.")

    print("[*] Step 4: Assessing anomaly score distributions...")
    # IsolationForest outputs: -1 for anomaly, 1 for normal
    raw_preds = iso_forest.predict(X)
    anomaly_scores = iso_forest.score_samples(X)
    normalized_scores = 0.5 - (anomaly_scores / 2.0)  # Map to 0..1 range

    anomaly_count = int(np.sum(raw_preds == -1))
    normal_count = int(np.sum(raw_preds == 1))
    anomaly_rate = round((anomaly_count / len(X)) * 100, 2)

    print("\n" + "-" * 40)
    print("  ANOMALY DETECTION DIAGNOSTICS")
    print("-" * 40)
    print(f"  Total Processed:    {len(X):,}")
    print(f"  Normal Records:     {normal_count:,} ({100 - anomaly_rate}%)")
    print(f"  Anomalous Records:  {anomaly_count:,} ({anomaly_rate}%)")
    print(f"  Mean Anomaly Score: {np.mean(normalized_scores):.4f}")
    print("-" * 40)

    print("[*] Step 5: Saving model artifacts and metadata...")
    os.makedirs("models", exist_ok=True)
    model_path = "models/anomaly_model.pkl"
    joblib.dump(iso_forest, model_path)

    metadata = {
        "model_name": "Network Anomaly Detector",
        "algorithm": "Isolation Forest",
        "version": "v1.3.0",
        "training_date": datetime.now().strftime("%Y-%m-%d"),
        "training_size": int(len(X)),
        "n_estimators": 100,
        "contamination": 0.08,
        "features": feature_cols,
        "normal_count": normal_count,
        "anomaly_count": anomaly_count,
        "anomaly_rate": f"{anomaly_rate}%",
        "evaluation_note": "Unsupervised algorithm. Supervised metrics (accuracy/recall) not applicable without labeled ground truth."
    }
    with open("models/anomaly_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"[✓] Artifacts saved:")
    print(f"    - Model:    {model_path}")
    print(f"    - Metadata: models/anomaly_metadata.json")
    print(f"    - Scaler:   models/anomaly_scaler.pkl")
    print("=" * 65)


if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "data/network_sample.csv"
    train_anomaly_model(path)
