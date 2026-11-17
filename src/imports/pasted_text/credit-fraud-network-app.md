You are a SENIOR FULL-STACK DEVELOPER, MACHINE LEARNING ENGINEER, UI/UX DESIGNER, DATABASE DEVELOPER, TEST ENGINEER, and PROJECT MENTOR.

I want you to BUILD THE COMPLETE WORKING WEB APPLICATION for my college mini project from ZERO to 100.

IMPORTANT:
Do NOT just explain the project.
Do NOT give me only sample code.
Do NOT give me pseudocode.
Do NOT leave major functionality as TODO.
I want a COMPLETE, RUNNABLE, TESTABLE project with all source code, folder structure, configuration files, database setup, ML training code, frontend, backend/application logic, testing instructions, and documentation.

==================================================
PROJECT INFORMATION
==================================================

Project Title:

"Credit Card Fraud Detection Using Historical Transaction Data and Anomaly Detection in Network Activities"

Project Type:

"Machine Learning Based Web/Application System"

The project has TWO major detection areas:

1. Credit Card Fraud Detection
2. Network Anomaly Detection

The system should contain:

1. User Module
2. Admin Module

The intended workflow is:

Historical Data Collection
        ↓
Data Preprocessing and Cleaning
        ↓
Feature Selection and Data Analysis
        ↓
Machine Learning / Anomaly Detection Model
        ↓
Credit Card Fraud Detection + Network Anomaly Detection
        ↓
Prediction and Classification
        ↓
Alerts, Reports, and Visualization
        ↓
Administrative Monitoring


==================================================
SOURCE DOCUMENT
==================================================

I have provided a project synopsis/PDF describing this project.

Use the uploaded PDF as the PRIMARY SOURCE for the project's terminology, objectives, modules, workflow, scope, and requirements.

IMPORTANT:
- Preserve the terminology used in the PDF.
- Do not rename the project into something else.
- Do not replace "User Module" and "Admin Module" with unrelated terminology.
- Do not remove the Network Anomaly Detection component.
- Do not invent requirements that contradict the PDF.
- Where the PDF leaves an implementation detail unspecified, choose a sensible technical implementation and clearly identify it as an implementation decision.

The PDF specifies the following technology direction:

Programming Language:
Python

Development Environment:
VS Code / Jupyter Notebook

Machine Learning:
Scikit-learn

Data Processing:
Pandas and NumPy

Data Visualization:
Matplotlib and Seaborn

Web Framework:
Flask or Streamlit

Database:
MySQL / MongoDB (optional)

For this implementation, USE:

Python
Streamlit
Scikit-learn
Pandas
NumPy
Matplotlib
Seaborn
Joblib
MySQL

You may use additional Python packages only when genuinely necessary.


==================================================
MAIN OBJECTIVE
==================================================

Build a complete machine-learning-based web application that can:

1. Analyze historical credit card transaction data.
2. Identify legitimate and potentially fraudulent transactions.
3. Clean and preprocess transaction data.
4. Apply machine learning algorithms for fraud detection.
5. Analyze network activity data.
6. Detect unusual/anomalous network activities.
7. Classify activities as normal or suspicious wherever appropriate.
8. Generate fraud/anomaly predictions.
9. Display detection results clearly.
10. Provide charts and statistics.
11. Generate reports.
12. Display alerts for suspicious activities.
13. Provide an Admin Module for managing datasets and models.
14. Monitor model performance.
15. Store relevant application information in MySQL.
16. Provide a professional, clean, responsive web interface.


==================================================
IMPORTANT IMPLEMENTATION RULE
==================================================

Build the project in a way that a college student can understand and demonstrate during a viva.

Avoid unnecessary enterprise complexity.

The project should be:
- beginner-friendly
- modular
- readable
- well commented
- easy to run in VS Code
- easy to explain during viva
- actually functional


==================================================
RECOMMENDED ARCHITECTURE
==================================================

Use this architecture:

Streamlit Web Application
        ↓
Application Logic
        ↓
ML Prediction Layer
        ↓
Trained Models
        ↓
Data Processing Layer
        ↓
MySQL Database

There should be two ML pipelines:

PIPELINE 1:
Credit Card Fraud Detection

PIPELINE 2:
Network Anomaly Detection


==================================================
ML REQUIREMENTS
==================================================

A) CREDIT CARD FRAUD DETECTION

Use a suitable supervised machine learning algorithm.

Prefer:
Random Forest Classifier

Because this is a classification problem involving:
- Legitimate transactions
- Fraudulent transactions

The model pipeline should include:

1. Dataset loading
2. Data inspection
3. Missing-value handling
4. Duplicate removal
5. Feature preparation
6. Appropriate scaling where required
7. Train/test split
8. Model training
9. Model evaluation
10. Model saving
11. Prediction
12. Probability/confidence where appropriate

Use:
- Precision
- Recall
- F1-score
- Confusion Matrix
- Accuracy as a supplementary metric

IMPORTANT:
Because fraud datasets can be highly imbalanced, do NOT rely only on accuracy.

Handle class imbalance sensibly.

If the selected dataset is highly imbalanced, use an appropriate approach such as:
- class_weight="balanced"
or another simple, explainable technique.

Do NOT use SMOTE unless it is genuinely necessary and correctly implemented.


==================================================
NETWORK ANOMALY DETECTION
==================================================

Use a suitable anomaly detection algorithm.

Prefer:
Isolation Forest

The system should learn patterns of network activity and identify observations that significantly differ from normal behavior.

The system should convert the model output into user-friendly results such as:

Normal Activity
Suspicious / Anomalous Activity

Clearly explain how Isolation Forest output is mapped to these labels.

Do not pretend that this is a real-time intrusion prevention system.

This project is initially based on historical/test datasets.

Real-time monitoring should be presented as a FUTURE ENHANCEMENT, not as something already implemented.


==================================================
DATASET REQUIREMENTS
==================================================

The application should support CSV datasets.

Expected functionality:

User can upload:
- Credit card transaction CSV
- Network activity CSV

The application should:
1. Validate uploaded file.
2. Show dataset preview.
3. Show number of rows and columns.
4. Show column names.
5. Show missing values.
6. Show duplicate count.
7. Perform appropriate preprocessing.
8. Run prediction.
9. Display results.

IMPORTANT:

Do not hard-code a prediction based on fake/random values.

The uploaded dataset must actually go through the trained ML model.

If the dataset format does not match the trained model, display a useful error explaining which columns are missing or incompatible.


==================================================
DATASET COMPATIBILITY
==================================================

Design the application so that it works with a standard publicly available credit-card fraud dataset.

A typical dataset may contain fields such as:

Time
V1
V2
V3
...
V28
Amount
Class

where:

Class:
0 = legitimate
1 = fraud

DO NOT assume that every dataset has exactly these columns without validation.

The training code should record the features used by the model.

Save model metadata, including:
- feature names
- preprocessing/scaler information
- target column
- model version
- training date
- evaluation metrics

Similarly, create appropriate metadata for the network anomaly model.


==================================================
MODEL FILES
==================================================

Save trained models locally, for example:

models/
    fraud_model.pkl
    anomaly_model.pkl
    fraud_scaler.pkl
    anomaly_scaler.pkl
    fraud_metadata.json
    anomaly_metadata.json

Use Joblib where appropriate.

The Streamlit application must LOAD the saved models.

Do NOT retrain models every time the user makes a prediction.

Training should be a separate operation.


==================================================
USER MODULE
==================================================

The User Module must contain:

1. Dataset Upload
2. Data Analysis
3. Fraud Prediction
4. Anomaly Detection
5. Result Visualization
6. Prediction Reports
7. Alert Display

Implement these properly.

Suggested pages:

Dashboard
Fraud Detection
Network Anomaly Detection
Reports


==================================================
DASHBOARD
==================================================

Create a professional dashboard.

Display useful metrics such as:

Total Transactions
Legitimate Transactions
Fraudulent Transactions
Fraud Rate
Total Network Records
Normal Network Activities
Anomalous Network Activities

Use charts such as:

- Legitimate vs Fraudulent transactions
- Normal vs Anomalous network activities
- Transaction amount distribution
- Fraud distribution
- Model performance metrics

The dashboard should update based on available prediction data instead of displaying permanently hard-coded numbers.


==================================================
FRAUD DETECTION PAGE
==================================================

Create a page:

"Credit Card Fraud Detection"

It should allow:

1. Upload CSV
2. Preview dataset
3. Analyze dataset
4. Run fraud prediction
5. Display prediction results
6. Display fraud probability/confidence if available
7. Highlight suspicious transactions
8. Show statistics
9. Download prediction results as CSV

Example result:

Transaction | Prediction | Probability
---------------------------------------
1           | Legitimate | 98.2%
2           | Fraudulent | 94.7%

Use clear visual indicators.

Do not expose raw ML labels like only 0 and 1 to the end user.


==================================================
NETWORK ANOMALY DETECTION PAGE
==================================================

Create:

"Network Anomaly Detection"

It should allow:

1. Upload network activity CSV
2. Preview data
3. Analyze dataset
4. Run anomaly detection
5. Display Normal/Anomalous results
6. Display anomaly statistics
7. Highlight suspicious records
8. Generate downloadable results
9. Show useful visualizations


==================================================
ALERT SYSTEM
==================================================

Create a simple alert system.

If fraudulent transactions are detected:

Display something like:

"⚠️ Suspicious transactions detected."

If anomalous network activities are detected:

Display:

"⚠️ Anomalous network activity detected."

Do not claim that these are confirmed crimes or confirmed attacks.

Use wording such as:
- Potentially Fraudulent
- Suspicious
- Potential Anomaly


==================================================
REPORTS
==================================================

Create a Reports page.

It should show:

Fraud Detection Report
- Total transactions
- Legitimate count
- Fraudulent count
- Fraud percentage
- Model metrics if available

Network Anomaly Report
- Total records
- Normal count
- Anomalous count
- Anomaly percentage

Allow CSV report download.

If practical, also provide a PDF report.

Do not make PDF generation unnecessarily complicated.


==================================================
ADMIN MODULE
==================================================

Create a proper Admin Module.

It must contain:

1. Admin Login
2. Dataset Management
3. Model Management
4. User Management
5. Report Management
6. Performance Monitoring
7. System Configuration

These terms should remain recognizable in the application because they correspond to the project synopsis.


==================================================
ADMIN LOGIN
==================================================

Create a login page.

Use secure password handling.

Do NOT store plain-text passwords in the database.

Use password hashing.

For the initial development/demo account, provide a clear setup mechanism such as:

Username:
admin

Password:
admin123

BUT:

Store only the hashed password in MySQL.

Make it easy for me to change the credentials.

Do not hard-code a production password into the application logic.


==================================================
DATASET MANAGEMENT
==================================================

Admin should be able to:

- View available datasets
- Add dataset
- Remove dataset metadata
- View dataset information
- See upload date
- See dataset type
- See number of records


==================================================
MODEL MANAGEMENT
==================================================

Admin should be able to:

- View available models
- Train fraud model
- Train anomaly model
- View model version
- View training date
- View evaluation metrics
- Load/use trained model

Do not retrain automatically every time the page loads.


==================================================
USER MANAGEMENT
==================================================

Create basic user management.

Admin can:

- View users
- Add users if appropriate
- Delete/deactivate users if appropriate
- View roles

At minimum support:

Admin
User


==================================================
REPORT MANAGEMENT
==================================================

Admin should be able to:

- View generated reports
- View prediction statistics
- Download reports


==================================================
PERFORMANCE MONITORING
==================================================

Display ML performance.

For fraud detection:

Accuracy
Precision
Recall
F1-score
Confusion Matrix

For anomaly detection:

Use appropriate evaluation/statistical information depending on whether labeled ground truth exists.

IMPORTANT:

Do not fabricate model metrics.

If ground-truth labels are unavailable, clearly state that supervised evaluation metrics cannot be calculated and show appropriate descriptive/anomaly statistics instead.


==================================================
SYSTEM CONFIGURATION
==================================================

Provide simple configuration options.

For example:

Fraud alert threshold
Anomaly contamination/threshold where appropriate
Number of displayed records
Other sensible settings

Do not expose dangerous or meaningless parameters to the user.


==================================================
DATABASE
==================================================

Use MySQL.

Create database:

credit_fraud_db

Create sensible tables, for example:

users
datasets
predictions
reports
models
system_config

You may modify the schema if you find a better normalized design.

Provide:

schema.sql

and clear instructions for:

1. Installing MySQL
2. Creating the database
3. Creating tables
4. Creating admin user
5. Configuring credentials

Use environment variables.

Create:

.env.example

For example:

DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=

Never expose real passwords in source code.


==================================================
SECURITY
==================================================

Implement basic security best practices.

At minimum:

- Password hashing
- Environment variables
- Input validation
- File type validation
- File size validation
- Avoid SQL injection using parameterized queries
- Do not expose database credentials
- Do not expose stack traces to normal users
- Handle invalid datasets gracefully


==================================================
UI/UX
==================================================

The interface should look like a professional college project, not a plain default Streamlit demo.

Use:

- Sidebar navigation
- Clear page titles
- Cards/metrics
- Tables
- Charts
- Alerts
- Consistent spacing
- Professional typography
- Responsive layout

Suggested navigation:

🏠 Dashboard

💳 Fraud Detection

🌐 Network Anomaly Detection

📊 Reports

🔐 Admin Login

⚙️ Admin Dashboard


Do not over-design it.

Keep it clean and easy to demonstrate.


==================================================
PROJECT STRUCTURE
==================================================

Create a clean modular structure similar to:

CreditCardFraudDetection/
│
├── app.py
│
├── requirements.txt
├── README.md
├── .env.example
├── .gitignore
│
├── data/
│   ├── creditcard.csv
│   └── network.csv
│
├── models/
│   ├── fraud_model.pkl
│   ├── anomaly_model.pkl
│   ├── fraud_scaler.pkl
│   ├── anomaly_scaler.pkl
│   ├── fraud_metadata.json
│   └── anomaly_metadata.json
│
├── pages/
│   ├── 1_Dashboard.py
│   ├── 2_Fraud_Detection.py
│   ├── 3_Network_Anomaly_Detection.py
│   ├── 4_Reports.py
│   └── 5_Admin.py
│
├── ml/
│   ├── train_fraud_model.py
│   ├── train_anomaly_model.py
│   ├── fraud_predictor.py
│   ├── anomaly_predictor.py
│   └── evaluation.py
│
├── preprocessing/
│   ├── fraud_preprocessing.py
│   └── network_preprocessing.py
│
├── database/
│   ├── db.py
│   ├── schema.sql
│   └── seed_admin.py
│
├── utils/
│   ├── authentication.py
│   ├── validation.py
│   ├── report_generator.py
│   └── helpers.py
│
└── tests/
    ├── test_preprocessing.py
    ├── test_fraud_model.py
    ├── test_anomaly_model.py
    └── test_database.py

You may improve this structure if necessary, but keep it understandable.


==================================================
IMPORTANT: MODEL TRAINING
==================================================

Provide separate scripts for training.

For example:

python ml/train_fraud_model.py

and:

python ml/train_anomaly_model.py

The scripts should:

1. Load dataset
2. Validate columns
3. Clean data
4. Preprocess data
5. Train model
6. Evaluate model
7. Save model
8. Save metadata
9. Print useful results

The web application should use the saved model files.


==================================================
ERROR HANDLING
==================================================

Handle common problems gracefully:

- Missing dataset
- Wrong CSV format
- Missing columns
- Extra columns
- Empty file
- Corrupted CSV
- Missing model
- Database unavailable
- Incorrect login
- Invalid configuration
- No predictions available
- Model not trained yet

Instead of crashing, show a useful message to the user.


==================================================
TESTING
==================================================

Create basic tests.

Test:

1. Data loading
2. Missing-value handling
3. Duplicate handling
4. Feature validation
5. Fraud prediction
6. Anomaly prediction
7. Database connection
8. Authentication

Provide commands to run tests.


==================================================
README
==================================================

Create a COMPLETE README.md.

It must contain:

1. Project Title
2. Project Description
3. Features
4. Technology Stack
5. System Architecture
6. Folder Structure
7. Requirements
8. Installation
9. Virtual Environment Setup
10. Dependency Installation
11. Dataset Setup
12. MySQL Setup
13. Environment Variable Setup
14. Model Training
15. Running the Application
16. Testing
17. User Module Explanation
18. Admin Module Explanation
19. ML Algorithms Explanation
20. Workflow
21. Limitations
22. Future Scope
23. Deployment instructions
24. Troubleshooting
25. Viva explanation


==================================================
REQUIREMENTS.TXT
==================================================

Generate a correct requirements.txt containing all required dependencies.

Do not include unnecessary packages.


==================================================
GITIGNORE
==================================================

Create a proper .gitignore.

It should exclude:

venv/
.env
__pycache__/
*.pyc
large datasets if appropriate
generated model files if appropriate
temporary files


==================================================
DATASET HANDLING
==================================================

Do not bundle huge datasets into the source code.

Explain exactly where I should download/place:

creditcard.csv

and:

network.csv

If a dataset requires a different filename or columns, explain how to adapt it.

Prefer publicly available datasets.

Do not claim that a dataset is included when it isn't.


==================================================
NO FAKE FUNCTIONALITY
==================================================

THIS IS EXTREMELY IMPORTANT.

Do NOT create buttons that simply show:

"Success"

without actually performing the operation.

Do NOT use fake ML predictions.

Do NOT generate fake accuracy values.

Do NOT hard-code dashboard statistics.

Do NOT create fake database functionality.

Every button should perform the actual intended operation.


==================================================
NO PLACEHOLDER TODOs
==================================================

Do not write:

# TODO
# implement later
# add your code here
# placeholder

for major functionality.

If something genuinely cannot be implemented because external credentials/data are required, implement everything possible and clearly explain the remaining configuration step.


==================================================
REALISTIC SCOPE
==================================================

This is a college mini project.

Do NOT turn it into a massive banking production system.

The goal is a strong working academic prototype.

The system should demonstrate:

Machine Learning
+
Data Preprocessing
+
Anomaly Detection
+
Web Application
+
Database
+
Visualization
+
Admin Module


==================================================
FUTURE SCOPE
==================================================

Keep these as future extensions rather than pretending they are already implemented:

- Real-time transaction monitoring
- Live network traffic analysis
- Automated alert systems
- Deep learning models
- Banking integration
- Cybersecurity system integration

These are future possibilities, not required current functionality.


==================================================
VIVA SUPPORT
==================================================

At the end, provide a "VIVA PREPARATION" section containing simple answers to:

1. What is credit card fraud detection?
2. What is anomaly detection?
3. Why Python?
4. Why Scikit-learn?
5. Why Random Forest?
6. Why Isolation Forest?
7. What is supervised learning?
8. What is unsupervised/anomaly detection?
9. What is preprocessing?
10. What is feature selection?
11. What is train-test split?
12. What is precision?
13. What is recall?
14. What is F1-score?
15. Why is accuracy alone not enough for fraud detection?
16. What is Streamlit?
17. Why did we use Streamlit?
18. What is MySQL?
19. What is Joblib?
20. What is the difference between fraud detection and network anomaly detection?
21. What are the limitations?
22. What is the future scope?


==================================================
IMPLEMENTATION APPROACH
==================================================

DO NOT dump the entire project blindly in one response if that would exceed your response/tool limits.

Instead, BUILD THE PROJECT IN PHASES.

PHASE 1:
Analyze requirements and provide final architecture and folder structure.

PHASE 2:
Create all base configuration files.

PHASE 3:
Create database schema and database connection.

PHASE 4:
Create data preprocessing.

PHASE 5:
Create fraud detection ML training pipeline.

PHASE 6:
Create network anomaly detection ML pipeline.

PHASE 7:
Create prediction modules.

PHASE 8:
Create Streamlit application and Dashboard.

PHASE 9:
Create Fraud Detection page.

PHASE 10:
Create Network Anomaly Detection page.

PHASE 11:
Create Reports.

PHASE 12:
Create Admin Login and Admin Module.

PHASE 13:
Integrate MySQL.

PHASE 14:
Testing and debugging.

PHASE 15:
README and deployment.

AFTER EACH PHASE:
- Give me the files created.
- Give complete code for each file.
- Explain where each file goes.
- Give exact commands to run.
- Tell me what output I should expect.
- Check for integration problems with previous phases.

Do not move to the next phase until the current phase is internally consistent.

However, if your environment allows you to create/edit project files directly, you may create the files directly instead of pasting enormous code blocks.


==================================================
VERY IMPORTANT CODING RULES
==================================================

Use:

Python 3.11+ compatible code.

Follow PEP 8 where practical.

Use functions instead of giant scripts.

Use meaningful variable names.

Add comments where a beginner would benefit.

Avoid unnecessary abstraction.

Use exception handling.

Use type hints where helpful.

Do not use deprecated APIs unnecessarily.

Make paths OS-independent using pathlib where appropriate.


==================================================
FINAL VERIFICATION
==================================================

Before declaring the project complete, perform a mental integration check.

Verify:

- imports match files
- file paths match folder structure
- model filenames match prediction code
- database table names match queries
- environment variable names match code
- Streamlit pages work
- navigation works
- login works
- CSV upload works
- prediction works
- charts use actual data
- reports use actual predictions
- model training produces expected files
- missing models are handled
- database errors are handled
- requirements.txt contains needed libraries
- README commands are correct


==================================================
FINAL RESPONSE FORMAT
==================================================

When everything is complete, provide:

1. FINAL PROJECT STRUCTURE
2. ALL SOURCE FILES
3. DATABASE SCHEMA
4. INSTALLATION COMMANDS
5. DATASET SETUP
6. MODEL TRAINING COMMANDS
7. APPLICATION RUN COMMAND
8. TEST COMMAND
9. ADMIN LOGIN SETUP
10. HOW TO USE THE APPLICATION
11. TROUBLESHOOTING
12. VIVA QUESTIONS AND ANSWERS
13. LIMITATIONS
14. FUTURE SCOPE
15. DEPLOYMENT GUIDE

Also provide a final checklist:

[ ] Python setup
[ ] Virtual environment
[ ] Dependencies
[ ] Dataset
[ ] Preprocessing
[ ] Fraud model
[ ] Anomaly model
[ ] Dashboard
[ ] Fraud Detection
[ ] Network Anomaly Detection
[ ] Reports
[ ] Admin Module
[ ] MySQL
[ ] Authentication
[ ] Testing
[ ] Documentation
[ ] Deployment


==================================================
START NOW
==================================================

First, analyze the project requirements from the provided PDF.

Then:

1. Explain the final architecture in simple language.
2. Show the complete folder structure.
3. Decide the exact technologies and justify them.
4. Identify any requirements that are unspecified in the PDF and clearly mark your implementation decisions.
5. Start PHASE 1.

Remember:

I am a beginner.

Explain difficult concepts like you are teaching a 5-year-old, but write the actual project code professionally.

I want a REAL WORKING PROJECT, not a theoretical answer.