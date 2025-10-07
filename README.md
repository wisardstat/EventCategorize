# EventCategorize

## Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL reachable at `172.19.32.1:5432`

## Frontend (Next.js + TailwindCSS)

Commands (from project root):

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:3000`.

## Backend (FastAPI)

Create and activate venv, install dependencies (already set up by scripts in this repo):

```bash
cd backend
./.venv/Scripts/activate  # Windows PowerShell
uvicorn app.main:app --reload --port 8000
```

Health check: `http://localhost:8000/health`

### Environment
The backend reads `.env` in `backend/` with variables:

```
POSTGRES_HOST=172.19.32.1
POSTGRES_DB=eventfeedback
POSTGRES_USER=postgres
POSTGRES_PASSWORD=matrix2805
POSTGRES_PORT=5432
DATABASE_URL=postgresql+psycopg://postgres:matrix2805@172.19.32.1:5432/eventfeedback
```

On startup, the backend creates tables `public."Question"` and `public."Answer"` if they do not exist.

### Database Schema

```sql
CREATE TABLE IF NOT EXISTS public."Question" (
  question_id text NOT NULL,
  question_title text NOT NULL,
  question_description text,
  question_categories text[],
  qrcode_url text,
  created_at timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Question_pkey" PRIMARY KEY (question_id)
);

CREATE TABLE IF NOT EXISTS public."Answer" (
  answer_id integer NOT NULL GENERATED ALWAYS AS IDENTITY,
  question_id text NOT NULL,
  answer_text text NOT NULL,
  category text NOT NULL,
  created_at timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Answer_pkey" PRIMARY KEY (answer_id)
);
```

Note: No ORM/DB relation between `Question` and `Answer`. `Answer.question_id` is a plain text field.