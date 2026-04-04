# KEFS — Kenya Fisheries Service Inspection System

A full-stack, risk-based inspection and certification platform built for the Kenya Fisheries Service (KFS). Inspectors use this system to assess fish landing stations, generate risk scores using a hybrid ML model, and issue regulatory certificates.

---

## 🏗️ System Architecture
Next.js Frontend (localhost:3000)
↕
FastAPI Backend (localhost:8000)
↕
Supabase (PostgreSQL Database)

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.12, Uvicorn |
| Database | Supabase (PostgreSQL) |
| ML Model | Scikit-Learn (Logistic Regression, 94% accuracy) |
| PDF Generation | ReportLab + QR Code |
| Explainability | SHAP |
| Version Control | GitHub |

---

## 🗄️ Database Tables

- `users` — Inspectors, supervisors, admins
- `landing_stations` — Fish landing sites across Kenya
- `inspections` — Inspection records with scoring fields
- `risk_assessments` — Hybrid risk scores per inspection
- `certifications` — Regulatory certificates issued

---

## 📊 Risk Scoring Formula

Final Score = 0.7 × (Rule-Based Score) + 0.3 × (ML Probability × 100)
Low    → 0–39
Medium → 40–69
High   → 70–100

---

## 🚀 Running Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| POST | `/api/inspections/create` | Create inspection + risk score |
| GET | `/api/inspections/all` | List all inspections |
| POST | `/api/certifications/create` | Issue certification |
| GET | `/api/certifications/{id}/download` | Download PDF certificate |
| GET | `/api/landing-stations/all` | List landing stations |

---

## 📁 Project Structure

kefs_inspection_system/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── inspections.py
│   │   ├── certifications.py
│   │   ├── landing_stations.py
│   │   └── dashboard.py
│   ├── modules/
│   │   ├── risk_engine.py
│   │   ├── ml_predictor.py
│   │   └── pdf_generator.py
│   └── models/
│       ├── risk_model.pkl
│       └── scaler.pkl
└── frontend/
├── app/
│   ├── dashboard/
│   ├── inspections/
│   ├── certifications/
│   ├── stations/
│   ├── reports/
│   ├── analytics/
│   ├── login/
│   └── register/
├── components/
│   └── layout/
│       ├── Sidebar.tsx
│       └── TopBar.tsx
├── context/
│   └── AuthContext.tsx
└── lib/
└── api.ts

---

## 👨‍💻 Author

Built as part of a dissertation project on risk-based fisheries inspection systems in Kenya.