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

## Production deployment

GitHub stores the source code; GitHub Pages serves static files and cannot run this app's Python API. Deploy the FastAPI backend and the Vite frontend to hosting that supports each runtime, then configure:

- Backend secret: `GEMINI_API_KEY`
- Backend allowed site origins: `FRONTEND_ORIGINS=https://your-frontend-domain`
- Frontend build variable: `VITE_API_BASE_URL=https://your-backend-domain`

Keep the Gemini key on the backend. Do not put it in a `VITE_` variable or commit a `.env` file. Add deployed domains to the variables before launching the hosted app.

## Institute branding

The navigation, homepage, institute logo, WhatsApp contact, footer links, and contact information follow [Skill Craft Institute](https://www.skillcraftinstitute.com/). The recommendations use the institute's approved digital courses; traditional academic track recommendations remain available in the assessment report.
