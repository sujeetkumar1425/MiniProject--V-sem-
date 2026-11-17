"""
Unit Tests for Model Prediction and Metrics Calculation.
Run with: pytest tests/test_models.py
"""

import os
import sys
import pytest

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from ml.fraud_predictor import FraudPredictor
from ml.anomaly_predictor import AnomalyPredictor
from ml.evaluation import calculate_metrics


def test_fraud_single_prediction():
    predictor = FraudPredictor()
    txn = {"Amount": 2400.0, "V14": -4.2, "V17": -3.5, "Time": 1200}
    res = predictor.predict_single(txn, threshold=0.5)

    assert "prediction" in res
    assert "confidence" in res
    assert res["prediction"] in ["Legitimate", "Potentially Fraudulent"]


def test_anomaly_single_prediction():
    predictor = AnomalyPredictor()
    packet = {
        "protocol": "tcp",
        "service": "http",
        "flag": "S0",
        "src_bytes": 180000,
        "dst_bytes": 0,
        "duration": 0.2
    }
    res = predictor.predict_single(packet)

    assert "status" in res
    assert "anomaly_score" in res
    assert res["status"] in ["Normal Activity", "Suspicious Activity"]
    assert res["anomaly_score"] >= 0.50


def test_metrics_calculation():
    y_true = [0, 0, 1, 1, 0, 1]
    y_pred = [0, 0, 1, 0, 0, 1]

    metrics = calculate_metrics(y_true, y_pred)
    assert metrics["accuracy"] > 0
    assert metrics["precision"] == 100.0  # 2 TP, 0 FP
    assert metrics["fn"] == 1
