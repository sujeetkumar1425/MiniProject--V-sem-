"""
Unit Tests for Preprocessing Pipelines.
Run with: pytest tests/test_preprocessing.py
"""

import os
import sys
import pytest
import pandas as pd
import numpy as np

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from preprocessing.fraud_preprocessing import FraudPreprocessor
from preprocessing.network_preprocessing import NetworkPreprocessor


def test_fraud_preprocessing_cleaning():
    df_raw = pd.DataFrame({
        "Time": [10, 20, 20, np.nan, 50],
        "V1": [0.1, 0.2, 0.2, 0.4, 0.5],
        "V14": [-1.0, -2.0, -2.0, -3.0, 0.5],
        "Amount": [100.0, 200.0, 200.0, 50.0, 30.0],
        "Class": [0, 1, 1, 0, 0]
    })
    preprocessor = FraudPreprocessor(scaler_path="tests/test_scaler.pkl")
    df_clean, stats = preprocessor.clean_data(df_raw)

    assert stats["missing_values_removed"] >= 1
    assert stats["duplicates_removed"] >= 1
    assert len(df_clean) == 3


def test_network_preprocessing():
    df_net = pd.DataFrame({
        "duration": [0.1, 120.0],
        "protocol_type": ["tcp", "udp"],
        "service": ["http", "dns"],
        "flag": ["SF", "S0"],
        "src_bytes": [250, 150000],
        "dst_bytes": [4000, 0]
    })
    preprocessor = NetworkPreprocessor(scaler_path="tests/test_net_scaler.pkl")
    X, features = preprocessor.fit_transform(df_net)

    assert X.shape[0] == 2
    assert "duration" in features
    assert "src_bytes" in features
