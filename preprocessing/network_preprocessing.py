"""
Network Activity Anomaly Data Preprocessing Module.
Preprocesses NSL-KDD compatible network logs, encodes categorical protocols/services/flags,
and standardizes numerical payload dimensions.
"""

import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any, Optional
from sklearn.preprocessing import StandardScaler
import joblib
import os


class NetworkPreprocessor:
    def __init__(self, scaler_path: Optional[str] = None):
        self.scaler = StandardScaler()
        self.scaler_path = scaler_path or "models/anomaly_scaler.pkl"
        self.numeric_features = ["duration", "src_bytes", "dst_bytes"]
        self.categorical_features = ["protocol_type", "service", "flag"]
        self.fitted_columns: list = []

    def clean_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Cleans network logs, trims column names, and drops null records."""
        df = df.copy()
        df.columns = df.columns.str.strip().str.lower()
        initial_rows = len(df)

        df = df.dropna()
        df = df.drop_duplicates()

        stats = {
            "initial_rows": initial_rows,
            "final_rows": len(df),
            "columns": list(df.columns)
        }
        return df, stats

    def fit_transform(self, df: pd.DataFrame) -> Tuple[np.ndarray, list]:
        """
        Encodes categorical variables with pd.get_dummies, scales numeric fields,
        and saves the fitted feature structure.
        """
        df_clean, stats = self.clean_data(df)

        # Standardize numeric columns
        num_cols = [c for c in self.numeric_features if c in df_clean.columns]
        if num_cols:
            df_clean[num_cols] = self.scaler.fit_transform(df_clean[num_cols])
            os.makedirs(os.path.dirname(self.scaler_path), exist_ok=True)
            joblib.dump(self.scaler, self.scaler_path)

        # One-hot encode categorical features
        cat_cols = [c for c in self.categorical_features if c in df_clean.columns]
        if cat_cols:
            df_encoded = pd.get_dummies(df_clean, columns=cat_cols, drop_first=True)
        else:
            df_encoded = df_clean

        # Drop ground truth target labels if present (unsupervised model)
        for target in ["class", "label", "status"]:
            if target in df_encoded.columns:
                df_encoded = df_encoded.drop(columns=[target])

        self.fitted_columns = list(df_encoded.columns)
        return df_encoded.values, self.fitted_columns

    def transform(self, df: pd.DataFrame, expected_features: list) -> np.ndarray:
        """Transforms incoming network logs to match the model's feature space."""
        df_clean, _ = self.clean_data(df)

        if os.path.exists(self.scaler_path):
            self.scaler = joblib.load(self.scaler_path)
            num_cols = [c for c in self.numeric_features if c in df_clean.columns]
            if num_cols:
                df_clean[num_cols] = self.scaler.transform(df_clean[num_cols])

        cat_cols = [c for c in self.categorical_features if c in df_clean.columns]
        if cat_cols:
            df_encoded = pd.get_dummies(df_clean, columns=cat_cols, drop_first=True)
        else:
            df_encoded = df_clean

        # Align columns to expected features
        for col in expected_features:
            if col not in df_encoded.columns:
                df_encoded[col] = 0

        df_aligned = df_encoded[expected_features]
        return df_aligned.values
