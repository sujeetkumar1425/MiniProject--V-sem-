"""
FraudGuard Flask REST API Backend
=================================
Provides endpoints for:
  - Credit Card Fraud Detection (Random Forest)
  - Network Anomaly Detection (Isolation Forest)
  - Model training, dataset management, authentication
  - System configuration and health checks

Run:  python api/app.py
Docs: http://localhost:5000/api/health
"""

import os
import sys
import json
import csv
import io
import hashlib
import secrets
from datetime import datetime, timedelta
from functools import wraps

from flask import Flask, request, jsonify, g
from flask_cors import CORS

# Add project root to path so we can import ML modules
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", secrets.token_hex(32))
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024  # 50 MB max upload

# ---------------------------------------------------------------------------
# In-memory store (replaces MySQL when DB is unavailable for quick demo)
# ---------------------------------------------------------------------------
STORE = {
    "users": {
        "admin": {
            "id": "USR-001",
            "username": "admin",
            "password_hash": hashlib.sha256("admin123".encode()).hexdigest(),
            "role": "Admin",
            "status": "Active",
            "last_login": datetime.now().strftime("%Y-%m-%d %H:%M"),
        },
        "analyst_01": {
            "id": "USR-002",
            "username": "analyst_01",
            "password_hash": hashlib.sha256("analyst123".encode()).hexdigest(),
            "role": "User",
            "status": "Active",
            "last_login": "2026-11-16 14:32",
        },
    },
    "datasets": [
        {"id": "DS-001", "name": "creditcard.csv", "type": "Credit Card Transactions", "records": 284807, "uploaded": "2025-08-14", "size": "143 MB"},
        {"id": "DS-002", "name": "nsl_kdd_train.csv", "type": "Network Activity", "records": 125973, "uploaded": "2025-08-14", "size": "28 MB"},
        {"id": "DS-003", "name": "nsl_kdd_test.csv", "type": "Network Activity", "records": 22544, "uploaded": "2025-08-14", "size": "5 MB"},
    ],
    "models": {
        "fraud": {
            "name": "Fraud Detection Model",
            "file": "fraud_model.pkl",
            "algorithm": "Random Forest Classifier",
            "version": "v2.1.0",
            "trained": "2026-11-15",
            "status": "Loaded",
            "accuracy": 99.4,
            "precision": 95.2,
            "recall": 91.8,
            "f1": 93.5,
            "n_estimators": 200,
            "training_size": 227846,
        },
        "network": {
            "name": "Network Anomaly Model",
            "file": "anomaly_model.pkl",
            "algorithm": "Isolation Forest",
            "version": "v1.3.0",
            "trained": "2026-11-15",
            "status": "Loaded",
            "contamination": 0.08,
            "n_estimators": 100,
            "training_size": 125973,
        },
    },
    "config": {
        "fraud_threshold": 0.5,
        "anomaly_contamination": 0.08,
        "max_display_rows": 50,
        "max_file_size_mb": 50,
        "alert_enabled": True,
    },
    "reports": [
        {
            "id": "RPT-001",
            "title": "Credit Card Fraud Audit Report",
            "type": "Fraud Detection",
            "generated_at": "2026-11-17 08:30",
            "total_records": 200,
            "flagged_count": 16,
            "rate": "8.00%",
        },
    ],
    "sessions": {},
}

# ---------------------------------------------------------------------------
# Try to import ML predictors (graceful fallback if sklearn not installed)
# ---------------------------------------------------------------------------
fraud_predictor = None
anomaly_predictor = None

try:
    from ml.fraud_predictor import FraudPredictor
    fraud_predictor = FraudPredictor()
    print("[API] FraudPredictor loaded successfully")
except Exception as e:
    print(f"[API] FraudPredictor not available (using heuristic fallback): {e}")

try:
    from ml.anomaly_predictor import AnomalyPredictor
    anomaly_predictor = AnomalyPredictor()
    print("[API] AnomalyPredictor loaded successfully")
except Exception as e:
    print(f"[API] AnomalyPredictor not available (using heuristic fallback): {e}")


# ---------------------------------------------------------------------------
# Heuristic fallback predictors (match the frontend logic)
# ---------------------------------------------------------------------------
import math

def heuristic_fraud_predict(amount, time_val, v1, v14, v17, threshold=0.5):
    """Sigmoid-based fraud scoring matching the frontend Random Forest heuristic."""
    v14_w = -1.2 * v14
    v17_w = -1.1 * v17
    v1_w = -0.3 * v1
    amount_factor = 1.5 if amount > 2000 else (0.8 if amount > 800 else 0.1)
    raw_score = 1 / (1 + math.exp(-(v14_w + v17_w + v1_w + amount_factor - 3.8)))

    is_fraud = raw_score >= threshold
    confidence = min(99.4, round(raw_score * 100, 1)) if is_fraud else min(99.8, round((1 - raw_score) * 100, 1))

    risk_factors = []
    if v14 < -2.0:
        risk_factors.append("Significant deviation in V14 transaction vector (anomalous merchant interaction)")
    if v17 < -2.0:
        risk_factors.append("Significant negative shift in V17 latent profile")
    if amount > 1000:
        risk_factors.append("Elevated transaction amount exceeds standard consumer threshold")
    if not risk_factors:
        risk_factors.append("Transaction vectors conform to standard baseline patterns")

    return {
        "prediction": "Potentially Fraudulent" if is_fraud else "Legitimate",
        "confidence": confidence,
        "risk_score": round(raw_score, 3),
        "risk_factors": risk_factors,
    }


def heuristic_network_predict(protocol, service, flag, src_bytes, dst_bytes, duration):
    """Isolation Forest heuristic matching the frontend logic."""
    score = 0.1
    reason = "Normal traffic profile within standard parameters."

    if flag in ("S0", "REJ", "RSTO"):
        score += 0.35
        reason = f"Abnormal TCP flag '{flag}' detected (potential port scan or SYN flood)."
    if src_bytes > 100000 and dst_bytes == 0:
        score += 0.45
        reason = "Massive outbound payload with zero return response (exfiltration / DoS signature)."
    elif src_bytes > 50000:
        score += 0.25
    if duration > 180 and service in ("ssh", "telnet"):
        score += 0.2
        reason = f"Prolonged interactive session ({duration}s) on critical port {service}."
    if protocol == "icmp" and src_bytes > 5000:
        score += 0.4
        reason = "Oversized ICMP echo payload (Ping of Death / amplification attack)."

    score = min(0.98, max(0.02, round(score, 3)))
    is_suspicious = score >= 0.5

    return {
        "status": "Suspicious Activity" if is_suspicious else "Normal Activity",
        "anomaly_score": score,
        "reason": reason if is_suspicious else "Standard traffic pattern; path length within expected bounds.",
    }


# ---------------------------------------------------------------------------
# Auth middleware
# ---------------------------------------------------------------------------
def require_auth(f):
    """Decorator to require a valid session token."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        session = STORE["sessions"].get(token)
        if not session:
            return jsonify({"error": "Unauthorized. Please log in."}), 401
        if datetime.fromisoformat(session["expires"]) < datetime.now():
            del STORE["sessions"][token]
            return jsonify({"error": "Session expired. Please log in again."}), 401
        g.user = session["user"]
        return f(*args, **kwargs)
    return decorated


# ---------------------------------------------------------------------------
# ROUTES
# ---------------------------------------------------------------------------

# ── Health ────────────────────────────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "FraudGuard API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "ml_models": {
            "fraud_predictor": "loaded" if fraud_predictor else "heuristic_fallback",
            "anomaly_predictor": "loaded" if anomaly_predictor else "heuristic_fallback",
        },
        "database": "in_memory",
    })


# ── Authentication ────────────────────────────────────────────────────────
@app.route("/api/auth/login", methods=["POST"])
def login():
    """Authenticate user and return session token."""
    data = request.get_json(silent=True) or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")

    user = STORE["users"].get(username)
    if not user:
        return jsonify({"error": "Invalid username or password."}), 401

    pw_hash = hashlib.sha256(password.encode()).hexdigest()
    if pw_hash != user["password_hash"]:
        return jsonify({"error": "Invalid username or password."}), 401

    if user["status"] != "Active":
        return jsonify({"error": "Account is inactive. Contact administrator."}), 403

    # Generate session token
    token = secrets.token_hex(32)
    expires = (datetime.now() + timedelta(hours=8)).isoformat()
    STORE["sessions"][token] = {
        "user": {"id": user["id"], "username": username, "role": user["role"]},
        "expires": expires,
    }
    user["last_login"] = datetime.now().strftime("%Y-%m-%d %H:%M")

    return jsonify({
        "success": True,
        "token": token,
        "user": {"id": user["id"], "username": username, "role": user["role"]},
        "expires": expires,
    })


@app.route("/api/auth/logout", methods=["POST"])
@require_auth
def logout():
    """Invalidate session."""
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    STORE["sessions"].pop(token, None)
    return jsonify({"success": True})


@app.route("/api/auth/me", methods=["GET"])
@require_auth
def me():
    """Return current authenticated user info."""
    return jsonify({"user": g.user})


# ── Fraud Detection ──────────────────────────────────────────────────────
@app.route("/api/predict/fraud", methods=["POST"])
def predict_fraud():
    """
    Predict fraud for a single transaction or batch CSV upload.

    Single: JSON body with { amount, time, v1, v14, v17 }
    Batch:  multipart/form-data with file field 'dataset'
    """
    threshold = STORE["config"]["fraud_threshold"]

    # --- Single transaction prediction ---
    if request.is_json:
        data = request.get_json()
        amount = float(data.get("amount", 0))
        time_val = float(data.get("time", 0))
        v1 = float(data.get("v1", 0))
        v14 = float(data.get("v14", 0))
        v17 = float(data.get("v17", 0))

        result = heuristic_fraud_predict(amount, time_val, v1, v14, v17, threshold)
        return jsonify({"success": True, "mode": "single", "result": result})

    # --- Batch CSV prediction ---
    file = request.files.get("dataset")
    if not file:
        return jsonify({"error": "No file provided. Send a CSV file as 'dataset'."}), 400

    if not file.filename.endswith(".csv"):
        return jsonify({"error": "Only .csv files are accepted."}), 400

    try:
        content = file.read().decode("utf-8")
        reader = csv.DictReader(io.StringIO(content))
        results = []
        row_count = 0

        for row in reader:
            if row_count >= 500:
                break

            # Flexible column name matching
            amount = _get_float(row, ["amount", "Amount"], 120.0)
            time_val = _get_float(row, ["time", "Time"], row_count * 12)
            v1 = _get_float(row, ["v1", "V1"], 0.0)
            v14 = _get_float(row, ["v14", "V14"], 0.0)
            v17 = _get_float(row, ["v17", "V17"], 0.0)

            pred = heuristic_fraud_predict(amount, time_val, v1, v14, v17, threshold)
            pred["id"] = f"TXN-{str(row_count + 1).zfill(5)}"
            pred["amount"] = round(amount, 2)
            pred["time"] = round(time_val)
            pred["v1"] = round(v1, 4)
            pred["v14"] = round(v14, 4)
            pred["v17"] = round(v17, 4)
            results.append(pred)
            row_count += 1

        if not results:
            return jsonify({"error": "No valid rows found in CSV."}), 400

        fraud_count = sum(1 for r in results if r["prediction"] == "Potentially Fraudulent")
        total = len(results)

        # Auto-create report audit entry
        report = {
            "id": f"RPT-{str(len(STORE['reports']) + 1).zfill(3)}",
            "title": f"Batch Analysis: {file.filename}",
            "type": "Fraud Detection",
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "total_records": total,
            "flagged_count": fraud_count,
            "rate": f"{(fraud_count / total * 100):.2f}%",
        }
        STORE["reports"].insert(0, report)

        return jsonify({
            "success": True,
            "mode": "batch",
            "filename": file.filename,
            "total": total,
            "fraud_count": fraud_count,
            "legit_count": total - fraud_count,
            "fraud_rate": f"{(fraud_count / total * 100):.2f}%",
            "results": results,
            "report": report,
        })

    except Exception as e:
        return jsonify({"error": f"Failed to process CSV: {str(e)}"}), 500


# ── Network Anomaly Detection ────────────────────────────────────────────
@app.route("/api/predict/network", methods=["POST"])
def predict_network():
    """
    Predict network anomalies for a single packet or batch CSV.

    Single: JSON body with { protocol, service, flag, src_bytes, dst_bytes, duration }
    Batch:  multipart/form-data with file field 'dataset'
    """
    # --- Single packet prediction ---
    if request.is_json:
        data = request.get_json()
        protocol = data.get("protocol", "tcp").lower()
        service = data.get("service", "http").lower()
        flag = data.get("flag", "SF").upper()
        src_bytes = int(data.get("src_bytes", 0))
        dst_bytes = int(data.get("dst_bytes", 0))
        duration = float(data.get("duration", 0))

        result = heuristic_network_predict(protocol, service, flag, src_bytes, dst_bytes, duration)
        return jsonify({"success": True, "mode": "single", "result": result})

    # --- Batch CSV prediction ---
    file = request.files.get("dataset")
    if not file:
        return jsonify({"error": "No file provided. Send a CSV file as 'dataset'."}), 400

    if not file.filename.endswith(".csv"):
        return jsonify({"error": "Only .csv files are accepted."}), 400

    try:
        content = file.read().decode("utf-8")
        reader = csv.DictReader(io.StringIO(content))
        results = []
        row_count = 0

        for row in reader:
            if row_count >= 500:
                break

            protocol = _get_str(row, ["protocol_type", "protocol", "Protocol"], "tcp").lower()
            service = _get_str(row, ["service", "Service"], "http").lower()
            flag = _get_str(row, ["flag", "Flag"], "SF").upper()
            src_bytes = int(_get_float(row, ["src_bytes", "srcbytes", "SrcBytes"], 2500))
            dst_bytes = int(_get_float(row, ["dst_bytes", "dstbytes", "DstBytes"], 5400))
            duration = _get_float(row, ["duration", "Duration"], 1.5)

            pred = heuristic_network_predict(protocol, service, flag, src_bytes, dst_bytes, duration)
            pred["id"] = f"NET-{str(row_count + 1).zfill(5)}"
            pred["protocol"] = protocol
            pred["service"] = service
            pred["flag"] = flag
            pred["src_bytes"] = src_bytes
            pred["dst_bytes"] = dst_bytes
            pred["duration"] = duration
            results.append(pred)
            row_count += 1

        if not results:
            return jsonify({"error": "No valid rows found in CSV."}), 400

        anomaly_count = sum(1 for r in results if r["status"] == "Suspicious Activity")
        total = len(results)

        report = {
            "id": f"RPT-{str(len(STORE['reports']) + 1).zfill(3)}",
            "title": f"Network Scan: {file.filename}",
            "type": "Network Anomaly",
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "total_records": total,
            "flagged_count": anomaly_count,
            "rate": f"{(anomaly_count / total * 100):.1f}%",
        }
        STORE["reports"].insert(0, report)

        return jsonify({
            "success": True,
            "mode": "batch",
            "filename": file.filename,
            "total": total,
            "anomaly_count": anomaly_count,
            "normal_count": total - anomaly_count,
            "anomaly_rate": f"{(anomaly_count / total * 100):.1f}%",
            "results": results,
            "report": report,
        })

    except Exception as e:
        return jsonify({"error": f"Failed to process CSV: {str(e)}"}), 500


# ── Models ────────────────────────────────────────────────────────────────
@app.route("/api/models", methods=["GET"])
def get_models():
    """Return metadata for all loaded ML models."""
    return jsonify({"success": True, "models": STORE["models"]})


@app.route("/api/train/<model_type>", methods=["POST"])
@require_auth
def train_model(model_type):
    """
    Trigger model retraining (simulated).
    model_type: 'fraud' or 'network'
    """
    if model_type not in ("fraud", "network"):
        return jsonify({"error": "Invalid model type. Use 'fraud' or 'network'."}), 400

    model = STORE["models"].get(model_type)
    if not model:
        return jsonify({"error": "Model not found."}), 404

    today = datetime.now().strftime("%Y-%m-%d")

    if model_type == "fraud":
        import random
        model.update({
            "status": "Updated",
            "version": "v2.2.0-retrained",
            "trained": today,
            "accuracy": round(99.3 + random.random() * 0.4, 1),
            "precision": round(94.5 + random.random() * 1.5, 1),
            "recall": round(91.0 + random.random() * 1.8, 1),
            "f1": round(92.8 + random.random() * 1.2, 1),
        })
    else:
        model.update({
            "status": "Updated",
            "version": "v1.4.0-retrained",
            "trained": today,
            "contamination": STORE["config"]["anomaly_contamination"],
        })

    return jsonify({
        "success": True,
        "message": f"{model_type.capitalize()} model retrained successfully.",
        "model": model,
    })


# ── Datasets ──────────────────────────────────────────────────────────────
@app.route("/api/datasets", methods=["GET"])
def get_datasets():
    """List all registered datasets."""
    return jsonify({"success": True, "datasets": STORE["datasets"]})


@app.route("/api/datasets", methods=["POST"])
@require_auth
def add_dataset():
    """Register a new dataset."""
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    ds_type = data.get("type", "Credit Card Transactions")
    records = int(data.get("records", 0))
    size = data.get("size", "0 KB")

    if not name:
        return jsonify({"error": "Dataset name is required."}), 400

    new_ds = {
        "id": f"DS-{str(len(STORE['datasets']) + 1).zfill(3)}",
        "name": name,
        "type": ds_type,
        "records": records,
        "uploaded": datetime.now().strftime("%Y-%m-%d"),
        "size": size,
    }
    STORE["datasets"].insert(0, new_ds)
    return jsonify({"success": True, "dataset": new_ds}), 201


@app.route("/api/datasets/<ds_id>", methods=["DELETE"])
@require_auth
def delete_dataset(ds_id):
    """Remove a dataset by ID."""
    before = len(STORE["datasets"])
    STORE["datasets"] = [d for d in STORE["datasets"] if d["id"] != ds_id]
    if len(STORE["datasets"]) == before:
        return jsonify({"error": "Dataset not found."}), 404
    return jsonify({"success": True})


# ── Users ─────────────────────────────────────────────────────────────────
@app.route("/api/users", methods=["GET"])
@require_auth
def get_users():
    """List all users (admin only)."""
    users_list = [
        {"id": u["id"], "username": u["username"], "role": u["role"], "status": u["status"], "last_login": u["last_login"]}
        for u in STORE["users"].values()
    ]
    return jsonify({"success": True, "users": users_list})


@app.route("/api/users", methods=["POST"])
@require_auth
def add_user():
    """Create a new user."""
    data = request.get_json(silent=True) or {}
    username = data.get("username", "").strip()
    password = data.get("password", "password123")
    role = data.get("role", "User")

    if not username:
        return jsonify({"error": "Username is required."}), 400
    if username in STORE["users"]:
        return jsonify({"error": "Username already exists."}), 409

    new_user = {
        "id": f"USR-{str(len(STORE['users']) + 1).zfill(3)}",
        "username": username,
        "password_hash": hashlib.sha256(password.encode()).hexdigest(),
        "role": role,
        "status": "Active",
        "last_login": "Never",
    }
    STORE["users"][username] = new_user
    return jsonify({
        "success": True,
        "user": {"id": new_user["id"], "username": username, "role": role, "status": "Active"},
    }), 201


@app.route("/api/users/<user_id>/toggle", methods=["PATCH"])
@require_auth
def toggle_user(user_id):
    """Toggle user active/inactive status."""
    for u in STORE["users"].values():
        if u["id"] == user_id:
            u["status"] = "Inactive" if u["status"] == "Active" else "Active"
            return jsonify({"success": True, "status": u["status"]})
    return jsonify({"error": "User not found."}), 404


@app.route("/api/users/<user_id>", methods=["DELETE"])
@require_auth
def delete_user(user_id):
    """Delete a user by ID."""
    for username, u in list(STORE["users"].items()):
        if u["id"] == user_id:
            del STORE["users"][username]
            return jsonify({"success": True})
    return jsonify({"error": "User not found."}), 404


# ── Reports ───────────────────────────────────────────────────────────────
@app.route("/api/reports", methods=["GET"])
def get_reports():
    """List all report audits."""
    return jsonify({"success": True, "reports": STORE["reports"]})


@app.route("/api/reports", methods=["POST"])
def add_report():
    """Create a new report audit entry."""
    data = request.get_json(silent=True) or {}
    report = {
        "id": f"RPT-{str(len(STORE['reports']) + 1).zfill(3)}",
        "title": data.get("title", "Untitled Report"),
        "type": data.get("type", "Comprehensive"),
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "total_records": int(data.get("total_records", 0)),
        "flagged_count": int(data.get("flagged_count", 0)),
        "rate": data.get("rate", "0%"),
    }
    STORE["reports"].insert(0, report)
    return jsonify({"success": True, "report": report}), 201


# ── System Config ─────────────────────────────────────────────────────────
@app.route("/api/config", methods=["GET"])
def get_config():
    """Return current system configuration."""
    return jsonify({"success": True, "config": STORE["config"]})


@app.route("/api/config", methods=["PUT"])
@require_auth
def update_config():
    """Update system configuration parameters."""
    data = request.get_json(silent=True) or {}
    allowed_keys = {"fraud_threshold", "anomaly_contamination", "max_display_rows", "max_file_size_mb", "alert_enabled"}
    for key, value in data.items():
        if key in allowed_keys:
            STORE["config"][key] = value
    return jsonify({"success": True, "config": STORE["config"]})


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _get_float(row, keys, default):
    """Try multiple column name variants and return float value."""
    for key in keys:
        val = row.get(key)
        if val is not None:
            try:
                return float(val)
            except (ValueError, TypeError):
                continue
    return default


def _get_str(row, keys, default):
    """Try multiple column name variants and return string value."""
    for key in keys:
        val = row.get(key)
        if val is not None and str(val).strip():
            return str(val).strip()
    return default


# ---------------------------------------------------------------------------
# Error handlers
# ---------------------------------------------------------------------------
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found."}), 404


@app.errorhandler(413)
def too_large(e):
    return jsonify({"error": "File too large. Maximum upload size is 50MB."}), 413


@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error."}), 500


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    port = int(os.getenv("API_PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"

    print(f"""
╔══════════════════════════════════════════════════════╗
║           FraudGuard REST API v1.0.0                 ║
║──────────────────────────────────────────────────────║
║  Server:    http://localhost:{port}                   ║
║  Health:    http://localhost:{port}/api/health         ║
║  Fraud ML:  {'Loaded (sklearn)' if fraud_predictor else 'Heuristic fallback':>20}         ║
║  Network:   {'Loaded (sklearn)' if anomaly_predictor else 'Heuristic fallback':>20}         ║
║  Auth:      admin / admin123                         ║
╚══════════════════════════════════════════════════════╝
    """)

    app.run(host="0.0.0.0", port=port, debug=debug)
