"""Add human evaluation fields to dbo.ProjectSubmissionNew.

The migration backs up the full table before changing its schema and performs
the backup and all ALTER statements in one transaction. It is safe to rerun:
existing columns are left unchanged.

Run from the backend directory:
    python migrate_project_submission_new_evaluations.py

Verify after running:
    SELECT ProjectId, VpEvaluationStatus, CommitteeEvaluationStatus
    FROM dbo.ProjectSubmissionNew;

Rollback (this permanently removes evaluation values entered after migration;
preserve those values before running these statements):
    SELECT ProjectId, VpEvaluationStatus, VpEvaluationComment,
           CommitteeEvaluationStatus, CommitteeEvaluationComment
    INTO dbo.ProjectSubmissionNewEvaluationRollbackBackup_YYYYMMDDHHMMSS
    FROM dbo.ProjectSubmissionNew;
    ALTER TABLE dbo.ProjectSubmissionNew DROP COLUMN
        VpEvaluationStatus, VpEvaluationComment,
        CommitteeEvaluationStatus, CommitteeEvaluationComment;
"""
from datetime import datetime

from sqlalchemy import text

from app.db.database import engine


SQL = """
IF COL_LENGTH('dbo.ProjectSubmissionNew', 'VpEvaluationStatus') IS NULL
    ALTER TABLE dbo.ProjectSubmissionNew ADD VpEvaluationStatus NVARCHAR(100) NULL;
IF COL_LENGTH('dbo.ProjectSubmissionNew', 'VpEvaluationComment') IS NULL
    ALTER TABLE dbo.ProjectSubmissionNew ADD VpEvaluationComment NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.ProjectSubmissionNew', 'CommitteeEvaluationStatus') IS NULL
    ALTER TABLE dbo.ProjectSubmissionNew ADD CommitteeEvaluationStatus NVARCHAR(100) NULL;
IF COL_LENGTH('dbo.ProjectSubmissionNew', 'CommitteeEvaluationComment') IS NULL
    ALTER TABLE dbo.ProjectSubmissionNew ADD CommitteeEvaluationComment NVARCHAR(MAX) NULL;
"""


def migrate() -> str:
    backup_table = f"ProjectSubmissionNewEvaluationBackup_{datetime.now():%Y%m%d%H%M%S%f}"
    with engine.begin() as connection:
        connection.execute(text(f"SELECT * INTO dbo.[{backup_table}] FROM dbo.ProjectSubmissionNew"))
        connection.execute(text(SQL))
    return backup_table


if __name__ == "__main__":
    created_backup = migrate()
    print(f"Backup created: dbo.{created_backup}")
    print("ProjectSubmissionNew evaluation migration complete")
