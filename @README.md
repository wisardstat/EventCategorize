# EventCategorize – Quick Start

## Stack
- Frontend: Next.js (App Router) + TailwindCSS
- Backend: FastAPI + SQLAlchemy
- DB: PostgreSQL

## Environment
Create `backend/.env` with:
```
POSTGRES_HOST=172.19.32.1
POSTGRES_DB=eventfeedback
POSTGRES_USER=postgres
POSTGRES_PASSWORD=matrix2805
POSTGRES_PORT=5432
DATABASE_URL=postgresql+psycopg://postgres:matrix2805@172.19.32.1:5432/eventfeedback
```

## Run (dev)
Frontend:
```bash
cd frontend
npm install   # first time
npm run dev   # http://localhost:3000
```

Backend (Windows PowerShell):
```bash
cd backend
./.venv/Scripts/activate
uvicorn app.main:app --reload --port 8000  # http://localhost:8000
```
Health: `http://localhost:8000/health`

If your frontend runs on a LAN IP (e.g., `http://172.x.x.x:3000`), ensure it is included in backend CORS allow_origins in `app/main.py`.

## API
- GET `/health` → `{ status: "ok" }`
- POST `/questions` → Create Question
  - Body: `{ "question_title": string, "question_description"?: string }`
  - 201 returns created Question
- GET `/questions` → List Questions (ordered by `created_at` desc)
- GET `/questions/{question_id}` → Get a Question
- POST `/answers` → Create Answer
  - Body: `{ "question_id": string, "answer_text": string, "category"?: string }`

## Authentication
- POST `/auth/login` → User login
  - Body: `{ "user_login": string, "user_password": string }`
  - Returns JWT token for authenticated sessions
- POST `/auth/register` → User registration
  - Body: `{ "user_code": string, "user_fname": string, "user_lname": string, "user_login": string, "user_password": string }`
- POST `/users/create-admin` → Create default admin user
  - Creates admin user with login: `admin`, password: `admin123`

**IMPORTANT SECURITY NOTE:** This application currently stores passwords as plain text without encryption. This is not recommended for production environments. Password encryption has been removed as requested.

## DB Schema (created on startup if missing)
- public."Question"(
  - `question_id` text PK,
  - `question_title` text,
  - `question_description` text,
  - `question_categories` text[],
  - `qrcode_url` text,
  - `created_at` timestamp default now
)
- public."Answer"(
  - `answer_id` int identity PK,
  - `question_id` text,
  - `answer_text` text,
  - `category` text,
  - `created_at` timestamp default now
)

## Frontend Pages
- `/` – Welcome, menu links
- `/create-question` – Create Question form; table listing Questions with "goto answer"
- `/present-answer/[questionId]` – Shows Question title/description; submit `answer_text`

## Notes
- Ensure PostgreSQL is reachable at `172.19.32.1:5432`.
- For CORS issues, verify the frontend origin is allowed in `backend/app/main.py`.
- **SECURITY WARNING:** Passwords are stored as plain text without encryption. This is a significant security risk and should not be used in production environments.
- The admin user is created with default credentials (admin/admin123) and should be changed immediately.

