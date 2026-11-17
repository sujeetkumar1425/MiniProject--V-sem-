"""
Evaluation Metrics & Visualization Utilities.
Generates confusion matrix, precision-recall curve, and tabular metrics.
"""

import numpy as np
from typing import Dict, Any, List
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_auc_score


def calculate_metrics(y_true: List[int], y_pred: List[int], y_prob: List[float] = None) -> Dict[str, Any]:
    """Calculates full classification suite for fraud detection."""
    acc = round(accuracy_score(y_true, y_pred) * 100, 2)
    prec = round(precision_score(y_true, y_pred, zero_division=0) * 100, 2)
    rec = round(recall_score(y_true, y_pred, zero_division=0) * 100, 2)
    f1 = round(f1_score(y_true, y_pred, zero_division=0) * 100, 2)
    cm = confusion_matrix(y_true, y_pred).tolist()

    result = {
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1": f1,
        "confusion_matrix": cm,
        "tn": cm[0][0],
        "fp": cm[0][1],
        "fn": cm[1][0],
        "tp": cm[1][1]
    }

    if y_prob is not None:
        try:
            result["roc_auc"] = round(roc_auc_score(y_true, y_prob) * 100, 2)
        except Exception:
            result["roc_auc"] = None

    return result
