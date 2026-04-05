# Question `created_at` Fix Runbook

## Goal
Repair historical `NULL` values and enforce non-null/default behavior for `[dbo].[Question].[created_at]`.

## Deploy Order
1. Backup database.
2. Run one-time migration script.
3. Restart backend service.
4. Verify API and DB checks.

## Commands
From `backend/`:

```powershell
$env:DEBUG='false'
.\.venv\Scripts\python .\fix_question_created_at.py
```

## Verification SQL
```sql
SELECT COUNT(*) AS null_created_at_count
FROM [dbo].[Question]
WHERE [created_at] IS NULL;
```

Expected: `0`.

## Post-check API
- `GET /questions` returns `200`.
- Each object has `created_at` as datetime.
- `POST /questions` creates new row with non-null `created_at`.
