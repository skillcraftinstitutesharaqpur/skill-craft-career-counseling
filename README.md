# Skill Craft Institute Career Guidance

A Skill Craft Institute branded career-counseling app. Students answer 42 questions and receive one recommended academic track and one digital course from the institute's approved course list.

## Run locally

Requirements: Python 3.10 or newer and Node.js 20.19+ (or 22.12+).

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Add your Gemini API key to `backend/.env` as `GEMINI_API_KEY=...`, then start the API:

```powershell
python -m uvicorn app.main:app --reload
```

### Frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`). The frontend uses `http://127.0.0.1:8000` for the local API unless `VITE_API_BASE_URL` is set.

## Vercel deployment

Deploy the frontend and backend as two Vercel projects from this same GitHub repository. Both projects should deploy from the `main` branch.

### Backend project

- Root Directory: `backend`
- Framework: Vercel should detect FastAPI from `requirements.txt` and `pyproject.toml`
- Entry point: `app.main:app` (configured in `backend/pyproject.toml`)
- Add environment variables in Vercel Project Settings:
  - `GEMINI_API_KEY`: a newly rotated Gemini key
  - `FRONTEND_ORIGINS`: the exact deployed frontend origin, for example `https://your-frontend.vercel.app`

### Frontend project

- Root Directory: `frontend`
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Add environment variable `VITE_API_BASE_URL` with the deployed backend origin, for example `https://your-backend.vercel.app`.

Keep the Gemini key only in the backend project's Vercel environment settings. Never put it in a `VITE_` variable or commit a `.env` file. Redeploy the frontend after setting its backend URL and redeploy the backend after setting its environment variables.

## Institute branding

The navigation, homepage, institute logo, WhatsApp contact, footer links, and contact information follow [Skill Craft Institute](https://www.skillcraftinstitute.com/). The recommendations use the institute's approved digital courses; traditional academic track recommendations remain available in the assessment report.
