"""Idempotent migration for AI scoring columns on dbo.ProjectSubmissionNew.

Backup before running:
SELECT ProjectId, AiScore, AiScoreComment, AiScoredAt
INTO dbo.ProjectSubmissionNewAiScoreBackup_YYYYMMDD
FROM dbo.ProjectSubmissionNew;

Rollback (only after confirming no score data must be retained):
ALTER TABLE dbo.ProjectSubmissionNew DROP COLUMN AiScore, AiScoreComment, AiScoredAt;
"""
from datetime import datetime

from sqlalchemy import text
from app.db.database import engine

SQL = """
IF COL_LENGTH('dbo.ProjectSubmissionNew', 'AiScore') IS NULL
    ALTER TABLE dbo.ProjectSubmissionNew ADD AiScore INT NULL;
IF COL_LENGTH('dbo.ProjectSubmissionNew', 'AiScoreComment') IS NULL
    ALTER TABLE dbo.ProjectSubmissionNew ADD AiScoreComment VARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.ProjectSubmissionNew', 'AiScoredAt') IS NULL
    ALTER TABLE dbo.ProjectSubmissionNew ADD AiScoredAt DATETIME2 NULL;
IF COL_LENGTH('dbo.ProjectSubmissionNew', 'AiIdeaSummary') IS NULL
    ALTER TABLE dbo.ProjectSubmissionNew ADD AiIdeaSummary VARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.ProjectSubmissionNew', 'AiIdeaSummarizedAt') IS NULL
    ALTER TABLE dbo.ProjectSubmissionNew ADD AiIdeaSummarizedAt DATETIME2 NULL;
"""

if __name__ == "__main__":
    with engine.begin() as connection:
        backup_table = f"ProjectSubmissionNewAiScoreBackup_{datetime.now():%Y%m%d%H%M%S}"
        connection.execute(text(f"SELECT * INTO dbo.[{backup_table}] FROM dbo.ProjectSubmissionNew"))
        connection.execute(text(SQL))
    print(f"Backup created: dbo.{backup_table}")
    print("ProjectSubmissionNew AI score migration complete")
