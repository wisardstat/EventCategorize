"""Idempotently add ProjectSubmissionNew.data_source with an idea-tank default."""
from datetime import datetime

from sqlalchemy import text

from app.db.database import engine


MIGRATION_SQL = """
IF COL_LENGTH('dbo.ProjectSubmissionNew', 'data_source') IS NULL
BEGIN
    ALTER TABLE dbo.ProjectSubmissionNew ADD data_source VARCHAR(50) NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew_data_source DEFAULT ('idea-tank') WITH VALUES;
END;
"""


if __name__ == "__main__":
    with engine.begin() as connection:
        backup_table = f"ProjectSubmissionNewDataSourceBackup_{datetime.now():%Y%m%d%H%M%S}"
        connection.execute(text(f"SELECT * INTO dbo.[{backup_table}] FROM dbo.ProjectSubmissionNew"))
        connection.execute(text(MIGRATION_SQL))
        verification = connection.execute(text("SELECT data_source, COUNT(*) AS total FROM dbo.ProjectSubmissionNew GROUP BY data_source ORDER BY data_source")).all()
    print(f"Backup created: dbo.{backup_table}")
    print("ProjectSubmissionNew data_source migration complete")
    for data_source, total in verification:
        print(f"{data_source}: {total}")
