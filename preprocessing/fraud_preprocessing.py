"""
Credit Card Fraud Data Preprocessing Module.
Cleans raw transaction datasets, scales numerical values, and prepares feature matrices for training and inference.
"""

import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any, Optional
from sklearn.preprocessing import StandardScaler
import joblib
import os


class FraudPreprocessor:
    def __init__(self, scaler_path: Optional[str] = None):
        self.scaler = StandardScaler()
        self.scaler_path = scaler_path or "models/fraud_scaler.pkl"
        self.is_fitted = False

    def clean_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Cleans dataset by handling missing values and duplicates.
        """
        initial_rows = len(df)
        
        # 1. Missing values
        missing_count = int(df.isnull().sum().sum())
        df = df.dropna()

        # 2. Duplicate rows
        duplicate_count = int(df.duplicated().sum())
        df = df.drop_duplicates()

        stats = {
            "initial_rows": initial_rows,
            "final_rows": len(df),
            "missing_values_removed": missing_count,
            "duplicates_removed": duplicate_count,
            "columns": list(df.columns)
        }
        return df, stats

    def fit_transform(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, list]:
        """
        Fits the scaler on Amount and Time and transforms features for training.
        """
        df_clean, stats = self.clean_data(df)

        if "Class" not in df_clean.columns:
            raise ValueError("Target column 'Class' is missing from the dataset.")

        y = df_clean["Class"].values
        feature_cols = [c for c in df_clean.columns if c != "Class"]

        X = df_clean[feature_cols].copy()

        # Scale Time and Amount if present
        cols_to_scale = [c for c in ["Time", "Amount"] if c in X.columns]
        if cols_to_scale:
            X[cols_to_scale] = self.scaler.fit_transform(X[cols_to_scale])
            self.is_fitted = True
            
            # Save scaler
            os.makedirs(os.path.dirname(self.scaler_path), exist_ok=True)
            joblib.dump(self.scaler, self.scaler_path)

        return X.values, y, feature_cols

    def transform(self, df: pd.DataFrame, expected_features: list) -> np.ndarray:
        """
        Transforms input transaction data for prediction using the pre-fitted scaler.
        """
        df_clean = df.copy()

        # Check for missing expected columns
        missing_cols = [col for col in expected_features if col not in df_clean.columns and col != "Class"]
        if missing_cols:
            raise ValueError(f"Incompatible dataset format. Missing columns: {missing_cols[:5]}...")

        X = df_clean[expected_features].copy()

        # Apply pre-fitted scaler
        if os.path.exists(self.scaler_path) and not self.is_fitted:
            self.scaler = joblib.load(self.scaler_path)
            self.is_fitted = True

        cols_to_scale = [c for c in ["Time", "Amount"] if c in X.columns]
        if cols_to_scale and self.is_fitted:
            X[cols_to_scale] = self.scaler.transform(X[cols_to_scale])

        return X.values
