"""
Model Training Script for Credit Card Fraud Detection.
Algorithm: Random Forest Classifier with class_weight='balanced'.
Usage: python ml/train_fraud_model.py [dataset_path]
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

# Ensure project root is in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from preprocessing.fraud_preprocessing import FraudPreprocessor


def train_fraud_model(dataset_path: str = "data/creditcard_sample.csv"):
    print("=" * 65)
    print("  CREDIT CARD FRAUD DETECTION — MODEL TRAINING PIPELINE")
    print("=" * 65)

    if not os.path.exists(dataset_path):
        print(f"[!] Dataset not found at '{dataset_path}'.")
        print("[*] Generating synthetic sample dataset for demonstration...")
        from data.generate_sample_data import generate_sample_creditcard_csv
        generate_sample_creditcard_csv(dataset_path)

    print(f"[*] Step 1: Loading dataset from '{dataset_path}'...")
    df = pd.read_csv(dataset_path)
    print(f"    Raw records: {len(df):,}, Columns: {len(df.columns)}")

    print("[*] Step 2: Data preprocessing & feature scaling...")
    preprocessor = FraudPreprocessor(scaler_path="models/fraud_scaler.pkl")
    X, y, feature_cols = preprocessor.fit_transform(df)
    
    fraud_count = int(np.sum(y == 1))
    legit_count = int(np.sum(y == 0))
    print(f"    Cleaned records: {len(X):,}")
    print(f"    Class Distribution -> Legitimate: {legit_count:,} ({legit_count/len(X)*100:.2f}%), Fraud: {fraud_count:,} ({fraud_count/len(X)*100:.2f}%)")

    print("[*] Step 3: Splitting into 80% Train and 20% Test sets (stratified)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"    Training samples: {len(X_train):,}, Test samples: {len(X_test):,}")

    print("[*] Step 4: Training Random Forest Classifier (n_estimators=200, class_weight='balanced')...")
    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)
    print("    Model training completed successfully.")

    print("[*] Step 5: Evaluating model on holdout test set...")
    y_pred = rf.predict(X_test)
    y_prob = rf.predict_proba(X_test)[:, 1]

    acc = round(accuracy_score(y_test, y_pred) * 100, 2)
    prec = round(precision_score(y_test, y_pred, zero_division=0) * 100, 2)
    rec = round(recall_score(y_test, y_pred, zero_division=0) * 100, 2)
    f1 = round(f1_score(y_test, y_pred, zero_division=0) * 100, 2)
    cm = confusion_matrix(y_test, y_pred).tolist()

    print("\n" + "-" * 40)
    print("  MODEL EVALUATION METRICS")
    print("-" * 40)
    print(f"  Accuracy:         {acc}%")
    print(f"  Precision:        {prec}%")
    print(f"  Recall:           {rec}%")
    print(f"  F1-Score:         {f1}%")
    print(f"  Confusion Matrix: TN={cm[0][0]}, FP={cm[0][1]}, FN={cm[1][0]}, TP={cm[1][1]}")
    print("-" * 40)

    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Legitimate", "Fraud"]))

    print("[*] Step 6: Saving model artifacts and metadata...")
    os.makedirs("models", exist_ok=True)
    model_path = "models/fraud_model.pkl"
    joblib.dump(rf, model_path)

    metadata = {
        "model_name": "Credit Card Fraud Classifier",
        "algorithm": "Random Forest Classifier",
        "version": "v2.1.0",
        "training_date": datetime.now().strftime("%Y-%m-%d"),
        "training_size": int(len(X_train)),
        "n_estimators": 200,
        "class_weight": "balanced",
        "features": feature_cols,
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1_score": f1,
        "confusion_matrix": cm
    }
    with open("models/fraud_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"[✓] Artifacts saved:")
    print(f"    - Model:    {model_path}")
    print(f"    - Metadata: models/fraud_metadata.json")
    print(f"    - Scaler:   models/fraud_scaler.pkl")
    print("=" * 65)


if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "data/creditcard_sample.csv"
    train_fraud_model(path)
