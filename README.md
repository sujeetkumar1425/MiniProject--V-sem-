# FraudGuard: Credit Card Fraud Detection & Network Anomaly Detection System

> **College Mini Project**  
> **Project Type:** Machine Learning Based Web/Application System  
> **Core Algorithms:** Random Forest Classifier (Supervised) + Isolation Forest (Unsupervised)  
> **Frontend:** React 19 + Vite + Tailwind CSS v4 + Recharts  
> **Backend & Machine Learning:** Python 3.11+, Scikit-Learn, Pandas, NumPy, MySQL, Bcrypt  

---

## Table of Contents
1. [Project Title & Overview](#1-project-title--overview)
2. [Project Description](#2-project-description)
3. [Key Features](#3-key-features)
4. [Technology Stack](#4-technology-stack)
5. [System Architecture](#5-system-architecture)
6. [Folder Structure](#6-folder-structure)
7. [Prerequisites & Requirements](#7-prerequisites--requirements)
8. [Installation & Setup](#8-installation--setup)
9. [Virtual Environment Setup](#9-virtual-environment-setup)
10. [Dependency Installation](#10-dependency-installation)
11. [Dataset Setup](#11-dataset-setup)
12. [MySQL Database Setup](#12-mysql-database-setup)
13. [Environment Variable Configuration](#13-environment-variable-configuration)
14. [Machine Learning Model Training](#14-machine-learning-model-training)
15. [Running the Application](#15-running-the-application)
16. [Automated Testing](#16-automated-testing)
17. [User Module Explanation](#17-user-module-explanation)
18. [Admin Module Explanation](#18-admin-module-explanation)
19. [Machine Learning Algorithms Explanation](#19-machine-learning-algorithms-explanation)
20. [System Workflow](#20-system-workflow)
21. [Limitations](#21-limitations)
22. [Future Scope](#22-future-scope)
23. [Deployment Instructions](#23-deployment-instructions)
24. [Troubleshooting Guide](#24-troubleshooting-guide)
25. [Viva Examination Q&A](#25-viva-examination-qa)

---

## 1. Project Title & Overview
**"Credit Card Fraud Detection Using Historical Transaction Data and Anomaly Detection in Network Activities"**

This system provides a unified security intelligence platform that tackles two critical threat surfaces in digital financial transactions:
1. **Credit Card Fraud Detection:** Detecting fraudulent transactions using supervised tree-based classification while handling severe class imbalance.
2. **Network Anomaly Detection:** Isolating abnormal network behavior (e.g., DoS floods, port scans, data exfiltration) using unsupervised tree-partition isolation.

---

## 2. Project Description
Financial institutions lose billions annually to credit card fraud and network intrusions. Standard detection rules often fail because fraud represents less than 1% of transactions and network zero-day attacks lack labeled historical signatures.

FraudGuard solves this by deploying:
- A **Random Forest Classifier** trained with `class_weight='balanced'` on historical credit card transaction vectors (PCA components V1–V28, Time, Amount).
- An **Isolation Forest** that isolates abnormal network connections (duration, protocol type, service, TCP flag, source and destination bytes) without requiring ground-truth labels.
- A **Modern, Interactive Web Application** built with React, Vite, and Tailwind CSS that enables live CSV upload, single transaction manual parameter testing, dynamic analytics dashboards, printable academic audit reports, and full administrative configuration.

---

## 3. Key Features
- **Dual Detection Pipelines:** Separate engines for financial transactions and network traffic telemetry.
- **Real-Time Client-Side Inference:** Real CSV parsing with instantaneous classification and confidence calculations.
- **Interactive Manual Testers:** Enter single transactions or network packets live to demonstrate detection logic to viva examiners.
- **Dynamic Telemetry Dashboard:** Live KPI cards, class breakdown pie charts, amount histograms, and alert banners synchronized with loaded data.
- **Printable Formal Reports:** Generate print-ready PDF evaluation reports with test metrics, confusion matrix, and examiner signature sections.
- **Administrative Console:** Manage datasets, retrain ML models with live execution logs, manage analyst accounts, and adjust decision thresholds.
- **Dark & Light Mode Support:** One-click toggle in the sidebar with high-contrast accessibility.

---

## 4. Technology Stack
| Layer | Technology |
|---|---|
| **Web UI** | React 19, TypeScript, Vite, Tailwind CSS v4, Recharts |
| **Machine Learning** | Python 3.11+, Scikit-Learn 1.3+, Joblib |
| **Data Processing** | Pandas 2.0+, NumPy 1.24+ |
| **Database** | MySQL 8.0+ / MariaDB |
| **Authentication** | Bcrypt password hashing |
| **Testing** | Pytest, Vitest |

---

## 5. System Architecture
```
                         ┌────────────────────────────────────────┐
                         │       User & Admin Web Interface       │
                         │   (React + Vite + Tailwind CSS v4)     │
                         └──────────────────┬─────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
     ┌─────────────────────────────┐                 ┌─────────────────────────────┐
     │  Credit Card Fraud Pipeline │                 │   Network Anomaly Pipeline  │
     │      (Supervised ML)        │                 │      (Unsupervised ML)      │
     ├─────────────────────────────┤                 ├─────────────────────────────┤
     │ • StandardScaler (Time/Amt) │                 │ • OneHotEncoder / Scaling   │
     │ • Random Forest Classifier  │                 │ • Isolation Forest Model    │
     │ • Balanced Class Weights    │                 │ • Subspace Path Isolation   │
     │ • Decision Threshold (0.50) │                 │ • Contamination (0.08)      │
     └──────────────┬──────────────┘                 └──────────────┬──────────────┘
                    │                                               │
                    └───────────────────────┬───────────────────────┘
                                            ▼
                         ┌────────────────────────────────────────┐
                         │         MySQL Database Storage         │
                         │ (users, datasets, models, predictions) │
                         └────────────────────────────────────────┘
```

---

## 6. Folder Structure
```
FraudGuard/
│
├── index.html                    # Application HTML shell
├── package.json                  # Frontend dependencies and build scripts
├── vite.config.ts                # Vite build configuration with Tailwind v4
├── tsconfig.json                 # TypeScript compiler configuration
├── requirements.txt              # Python ML & database dependencies
├── .env.example                  # Environment template
├── README.md                     # Complete project documentation & Viva Q&A
│
├── src/                          # Frontend Application Source
│   ├── App.tsx                   # Main component & page routing
│   ├── main.tsx                  # React entry point
│   ├── index.css                 # Global theme & Tailwind CSS v4 import
│   ├── context/
│   │   └── AppContext.tsx        # Central state, real CSV parser, ML scoring
│   ├── components/
│   │   └── Sidebar.tsx           # Navigation, model status, theme toggler
│   ├── pages/
│   │   ├── Dashboard.tsx         # Real-time KPI charts and alert banner
│   │   ├── FraudDetection.tsx    # CSV upload, table, single transaction tester
│   │   ├── NetworkAnomaly.tsx    # CSV upload, scatter plot, single packet tester
│   │   ├── Reports.tsx           # Confusion matrix, CSV export, printable PDF view
│   │   ├── AdminLogin.tsx        # Secure admin authentication
│   │   └── AdminDashboard.tsx    # Datasets, models, users, configuration
│   └── data/
│       └── mockData.ts           # Baseline data structures and metrics
│
├── database/                     # MySQL Database Setup
│   ├── schema.sql                # Complete relational schema with seed data
│   ├── db.py                     # Safe parameterized MySQL connector
│   └── seed_admin.py             # Bcrypt password hashing script
│
├── preprocessing/                # Data Preprocessing Pipelines
│   ├── fraud_preprocessing.py    # Missing values, duplicates, StandardScaler
│   └── network_preprocessing.py  # Encoding protocols, scaling network payloads
│
├── ml/                           # Machine Learning Pipelines
│   ├── train_fraud_model.py      # Random Forest training script
│   ├── train_anomaly_model.py    # Isolation Forest training script
│   ├── fraud_predictor.py        # Fraud inference engine
│   ├── anomaly_predictor.py      # Network anomaly inference engine
│   └── evaluation.py             # Metrics & confusion matrix calculations
│
├── data/                         # Datasets & Generator
│   ├── creditcard_sample.csv     # Ready-to-use sample transaction dataset
│   ├── network_sample.csv        # Ready-to-use sample network activity dataset
│   └── generate_sample_data.py   # Script to regenerate sample datasets
│
└── tests/                        # Automated Unit Tests
    ├── test_preprocessing.py     # Data cleaning tests
    └── test_models.py            # Inference and metric tests
```

---

## 7. Prerequisites & Requirements
- **Node.js:** v18.0 or newer (v22 recommended)
- **pnpm / npm:** Included with Node.js
- **Python:** v3.10 or v3.11+
- **MySQL:** v8.0 or higher (optional for frontend demo, required for full DB persistence)

---

## 8. Installation & Setup
Clone or navigate to the repository directory:
```bash
cd "e:\College\Mini Project\FraudGuard"
```

Install frontend packages:
```bash
npm install
```

---

## 9. Virtual Environment Setup
Create and activate an isolated Python environment:
```bash
# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

---

## 10. Dependency Installation
Install required Python packages:
```bash
pip install -r requirements.txt
```

---

## 11. Dataset Setup
Sample datasets are already included in the `data/` directory:
- `data/creditcard_sample.csv` (Credit card transaction dataset)
- `data/network_sample.csv` (NSL-KDD compatible network traffic dataset)

To generate fresh sample records:
```bash
python data/generate_sample_data.py
```

---

## 12. MySQL Database Setup
1. Log in to MySQL command line:
```bash
mysql -u root -p
```
2. Execute the schema script:
```sql
SOURCE e:/College/Mini Project/FraudGuard/database/schema.sql;
```
3. Verify tables created:
```sql
USE credit_fraud_db;
SHOW TABLES;
```

---

## 13. Environment Variable Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` with your local MySQL password:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=credit_fraud_db
DB_USER=root
DB_PASSWORD=your_mysql_password
ADMIN_USER=admin
ADMIN_PASSWORD=admin123
```

---

## 14. Machine Learning Model Training
Train both models independently using the modular training scripts:

### Train Credit Card Fraud Model (Random Forest)
```bash
python ml/train_fraud_model.py
```
*Outputs: `models/fraud_model.pkl`, `models/fraud_scaler.pkl`, `models/fraud_metadata.json`*

### Train Network Anomaly Model (Isolation Forest)
```bash
python ml/train_anomaly_model.py
```
*Outputs: `models/anomaly_model.pkl`, `models/anomaly_scaler.pkl`, `models/anomaly_metadata.json`*

---

## 15. Running the Application
The Vite development server can be started with:
```bash
npm run dev
```
Open your browser and navigate to the preview URL (e.g., `http://localhost:8443` or `http://localhost:5173`).

---

## 16. Automated Testing
Run the Python unit test suite:
```bash
pytest tests/
```
To verify the frontend build:
```bash
npm run build
```

---

## 17. User Module Explanation
1. **Dashboard:** Displays real-time metrics, class distribution pie charts, amount histograms, and active threat alert banners.
2. **Fraud Detection Page:**
   - **Batch CSV Analysis:** Upload any transaction CSV with `Time, Amount, V1–V28`. Shows data cleaning metrics, classification tags, confidence percentages, and CSV download.
   - **Live Single Test:** Interactive form where users or examiners input single transaction features (`Amount`, `Time`, `V1`, `V14`, `V17`) to observe instant model classification.
3. **Network Anomaly Page:**
   - **Batch CSV Analysis:** Upload network logs (`duration`, `protocol_type`, `service`, `flag`, `src_bytes`, `dst_bytes`). Displays anomaly score scatter plot and protocol breakdown.
   - **Live Packet Test:** Real-time test form for packet protocols, ports, and flags to observe Isolation Forest partition depth.
4. **Reports Page:**
   - Detailed model evaluation with full Confusion Matrix (`TN, FP, FN, TP`).
   - One-click CSV report export.
   - **Printable Formal View:** Formats the report for printing or saving as PDF for project viva submission.

---

## 18. Admin Module Explanation
- **Admin Authentication:** Access via `/admin-login` with username `admin` and password `admin123`.
- **Dataset Management:** Register new dataset metadata, view record counts, and remove obsolete entries.
- **Model Management:** View model versions, serialized file paths, hyperparameters, and trigger live model retraining with simulated console logs.
- **User Management:** Create analyst accounts, toggle active/inactive states, and delete users.
- **Report Management:** Access the historical audit log of all batch analyses and exports.
- **System Configuration:** Sliders to adjust the decision threshold (default 0.50) and contamination factor (default 0.08), which immediately update detection logic across the application.

---

## 19. Machine Learning Algorithms Explanation

### 1. Random Forest Classifier (Credit Card Fraud)
- **Type:** Supervised ensemble classification.
- **Mechanism:** Builds an ensemble of decision trees (200 trees) on bootstrap samples. Each split considers a random subset of features. The final prediction is determined by majority vote or class probability averaging.
- **Addressing Class Imbalance:** In credit card datasets, fraud accounts for <1% of records. We use `class_weight='balanced'`, which automatically weights inversely proportional to class frequencies:
  $$w_j = \frac{n}{k \cdot n_j}$$
  This heavily penalizes misclassifying a fraudulent transaction.

### 2. Isolation Forest (Network Anomaly Detection)
- **Type:** Unsupervised anomaly detection.
- **Mechanism:** Isolates anomalies instead of profiling normal points. Constructs random decision trees by randomly selecting a feature and a random split value between the min and max.
- **Mathematical Principle:** Anomalies require significantly fewer random splits to isolate because they reside in low-density feature space.
  $$\text{Score}(x) = 2^{-\frac{E(h(x))}{c(n)}}$$
  Where $E(h(x))$ is the average path length across trees and $c(n)$ is the average path length of unsuccessful searches in a Binary Search Tree.

---

## 20. System Workflow
1. **Data Ingestion:** Upload CSV or enter parameters through the web interface.
2. **Preprocessing:** Standardize numeric columns (`StandardScaler`), handle null values, remove duplicates, and encode categorical labels.
3. **Inference Execution:**
   - Transactions evaluated against the Random Forest decision threshold.
   - Network packets scored through Isolation Forest tree depths.
4. **Result Delivery:** Visual classification badges, confidence scores, risk explanations, and charts.
5. **Auditing & Reporting:** Logged in MySQL database and exportable as CSV or PDF report.

---

## 21. Limitations
- **Batch Processing:** Currently optimized for uploaded batch files and simulated live testing rather than direct wire-speed packet capture (PCAP).
- **Synthetic Features:** Kaggle credit card datasets use PCA-transformed features (V1–V28) for privacy, hiding raw merchant names.
- **Stationary Models:** Models are re-trained periodically rather than updating online with incremental learning.

---

## 22. Future Scope
- **Real-Time Network Sniffing:** Integration with `scapy` or `libpcap` for continuous live network interface monitoring.
- **Deep Learning Ensembles:** Hybrid Autoencoders or LSTM models for temporal sequence fraud detection.
- **Explainable AI (XAI):** SHAP (SHapley Additive exPlanations) values to explain exact feature contributions for each transaction.

---

## 23. Deployment Instructions
### Frontend Production Build
```bash
npm run build
npm run preview
```

### Production Nginx Reverse Proxy (Example)
```nginx
server {
    listen 80;
    server_name fraudguard.college.edu;

    location / {
        root /var/www/fraudguard/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 24. Troubleshooting Guide
| Issue | Cause | Solution |
|---|---|---|
| CSV Upload Fails | Non-CSV file format or missing columns | Ensure the file ends with `.csv` and contains `Amount` and `V1–V28` |
| MySQL Connection Refused | MySQL service stopped | Start MySQL via Windows Services (`net start MySQL80`) or systemctl |
| Bcrypt Import Error | Missing C++ build tools | Install precompiled wheel: `pip install bcrypt` |
| Low Fraud Recall | High decision threshold | Lower the threshold in Admin Console &rarr; System Config to 0.40 |

---

## 25. Viva Examination Q&A

**Q1: Why is Accuracy misleading for credit card fraud detection?**  
*Answer:* Because fraud represents less than 1% of transactions (severe class imbalance). A baseline model that classifies every transaction as legitimate would achieve >99% accuracy while failing to detect a single fraud incident. Precision, Recall, and F1-Score are the meaningful metrics.

**Q2: What is the difference between Precision and Recall in fraud detection?**  
*Answer:* Precision measures what percentage of flagged transactions were actually fraudulent (avoiding false alarms). Recall measures what percentage of all actual fraudulent transactions were successfully detected (avoiding missed fraud). In banking, Recall is prioritized to prevent financial loss.

**Q3: Why use Isolation Forest instead of K-Means for network anomalies?**  
*Answer:* K-Means assumes spherical clusters and calculates distances from centroids, which is computationally expensive ($O(n^2)$) and struggles in high dimensions. Isolation Forest has linear time complexity ($O(n)$) and isolates outliers directly through random partitioning.

**Q4: How do you handle class imbalance in Random Forest?**  
*Answer:* We configure `class_weight='balanced'`. This adjusts weights inversely proportional to class frequencies, assigning higher cost to errors on the minority class during tree construction.

**Q5: Why are the features named V1 through V28 in the credit card dataset?**  
*Answer:* Due to confidentiality issues, the original credit card dataset features were transformed using Principal Component Analysis (PCA). Only `Time` and `Amount` were not transformed.

---
*Created for College Mini Project Evaluation · FraudGuard Detection System*


## CSV upload and report export

### Network anomaly CSV
Upload a `.csv` file with these columns (column order can vary):
`duration`, `protocol_type`, `service`, `flag`, `src_bytes`, `dst_bytes`.
The parser also accepts headerless NSL-KDD-style CSV rows where those six fields are the first six columns. Common `proto`, `state`, `sbytes`, and `dbytes` aliases are supported.

### Credit-card fraud CSV
The file must contain `Time`, `Amount`, `V1`, `V14`, and `V17` columns. Other columns (including `V2`–`V28` and `Class`) may also be present.

CSV parsing handles UTF-8 BOMs, quoted values, escaped quotes, and commas/newlines inside quoted cells. Invalid/missing required columns now produce a clear error instead of being silently replaced with generated values.

### Exporting reports
- Use **Export CSV** on either scan page to download all currently analyzed records and their predictions.
- Open **Reports → Printable Formal View → Print / Save as PDF**, then select **Save as PDF** in the browser print dialog. The PDF includes scan summaries and up to 100 flagged records from each module.
- The report CSV buttons include the summary and the full scan result rows.
#   M i n i P r o j e c t - - V - s e m -  
 