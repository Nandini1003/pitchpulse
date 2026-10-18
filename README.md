# CallCompass — cold-call live assistant

A working starter with the assignment's **eight fixed stages**: Opening, Purpose, Permission, Their Business, Their Need, Objection, Next Step, Close. Stages may be skipped/revisited and calls can end early. The app saves notes and verbatim prospect words separately, plus actual outcome. Gemini provides optional contextual guidance via the backend, never from the browser.

## 1. Supabase
Create a free Supabase project. In SQL Editor, run `supabase/schema.sql`. Copy project URL and **service_role** key into the backend's environment variables only. RLS is enabled; never put service_role in Vite, GitHub or browser. This starter is for a trusted single-caller demo, not production multi-user auth.

## 2. Backend locally
`cd backend`
`python -m venv .venv`
Activate on Windows: `.venv\\Scripts\\activate`; macOS/Linux: `source .venv/bin/activate`.
`pip install -r requirements.txt`
Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `FRONTEND_ORIGIN` in your shell (see `.env.example`; the file is not loaded automatically).
`uvicorn main:app --reload`
Visit `http://localhost:8000/health` and `http://localhost:8000/docs`.

## 3. Frontend locally
`cd frontend && npm install && npm run dev`
Open Vite's URL, typically `http://localhost:5173`. Set `VITE_API_URL=http://localhost:8000` in frontend `.env` if needed. Only `VITE_API_URL` belongs in frontend environment.

## 4. Deployment
Push this folder to a public GitHub repository (do not include the private transcripts). Render: new Web Service, root directory `backend`, build `pip install -r requirements.txt`, start `uvicorn main:app --host 0.0.0.0 --port $PORT`; add Supabase and Gemini env vars and set `FRONTEND_ORIGIN` to deployed Vercel origin. Vercel: import repo, root directory `frontend`, framework Vite, build `npm run build`, output `dist`, env `VITE_API_URL` = deployed Render URL. Re-deploy both after updating origins. Free services may spin down; test `/health` before demo.

## Endpoints
`GET /health`, `GET /stages`, `POST /calls`, `POST /calls/{id}/stages`, `POST /calls/{id}/close`, `GET /calls`, `GET /calls/{id}`, `POST /ai/suggest`.

## LLM choice
Google Gemini via Google AI Studio: JSON output and simple HTTP integration. Actual availability/quotas depend on account/region; check your account. If key is absent, manual call tracking still works and AI returns a clear error.

## Remaining submission steps
Test end-to-end with one fictional call, verify stage 5 verbatim quote and early close, confirm deployed links, then personally record a six-minute on-camera walkthrough and submit GitHub URL, video link, `/health` URL. Do not publish original supplied transcripts or pretend deployment has already happened.
