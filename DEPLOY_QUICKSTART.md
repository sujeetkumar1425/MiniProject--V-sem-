# FraudGuard quick deployment (presentation build)

## Frontend — Vercel
1. Push this project to GitHub.
2. Import the repository in Vercel; Framework Preset: Other (the checked-in `vercel.json` builds the Vite static frontend).
3. Build command: `npm run build`; Output Directory: `dist`.
4. Do not configure Python requirements on Vercel.

## Backend — Render
1. Create a Web Service from the same repository.
2. Runtime: Python; Build Command: `pip install -r requirements-api.txt`.
3. Start Command: `gunicorn api.app:app --bind 0.0.0.0:$PORT`.
4. Health check path: `/api/health`.

## Important model-status note
The uploaded project source does not include trained `.pkl` model artifacts. The current API routes call heuristic scoring functions directly. Do not describe the current live predictions as trained Random Forest / Isolation Forest predictions, and do not quote the hard-coded dashboard metrics as measured evaluation results. Train and include the model artifacts before claiming model-backed inference.

## Datasets received
- `creditcard.csv` — credit-card transaction dataset.
- `KDDTrain+.txt` and `KDDTest+.txt` — NSL-KDD train/test data.

Keep these large datasets out of the frontend deployment. Use them in the backend training workflow only.
