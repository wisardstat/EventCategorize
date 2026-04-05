#!/usr/bin/env python3
"""
One-time migration for dbo.Question.created_at:
1) Backfill NULL values.
2) Enforce DEFAULT(GETDATE()).
3) Enforce NOT NULL.
"""

from __future__ import annotations

import os
import sys

from sqlalchemy import text

# Keep local script execution resilient if .env contains non-boolean DEBUG values.
os.environ.setdefault("DEBUG", "false")

from app.db.database import engine


def run_migration() -> int:
    print("=== Question.created_at migration start ===")

    with engine.begin() as conn:
        null_before = conn.execute(
            text("SELECT COUNT(1) FROM [dbo].[Question] WHERE [created_at] IS NULL")
        ).scalar_one()
        print(f"NULL rows before: {null_before}")

        update_result = conn.execute(
            text(
                """
                UPDATE [dbo].[Question]
                SET [created_at] = GETDATE()
                WHERE [created_at] IS NULL
                """
            )
        )
        backfilled = update_result.rowcount or 0
        print(f"Rows backfilled: {backfilled}")

        conn.execute(
            text(
                """
                DECLARE @constraint_name SYSNAME;

                SELECT @constraint_name = dc.name
                FROM sys.default_constraints AS dc
                INNER JOIN sys.columns AS c
                    ON c.default_object_id = dc.object_id
                INNER JOIN sys.tables AS t
                    ON t.object_id = c.object_id
                INNER JOIN sys.schemas AS s
                    ON s.schema_id = t.schema_id
                WHERE s.name = 'dbo'
                  AND t.name = 'Question'
                  AND c.name = 'created_at';

                IF @constraint_name IS NOT NULL
                BEGIN
                    EXEC('ALTER TABLE [dbo].[Question] DROP CONSTRAINT [' + @constraint_name + ']');
                END
                """
            )
        )
        print("Dropped existing default constraint (if any).")

        conn.execute(
            text(
                """
                ALTER TABLE [dbo].[Question]
                ADD CONSTRAINT [DF_Question_created_at] DEFAULT (GETDATE()) FOR [created_at]
                """
            )
        )
        print("Added default constraint DF_Question_created_at.")

        conn.execute(
            text(
                """
                ALTER TABLE [dbo].[Question]
                ALTER COLUMN [created_at] datetime2(6) NOT NULL
                """
            )
        )
        print("Altered [created_at] to NOT NULL.")

        null_after = conn.execute(
            text("SELECT COUNT(1) FROM [dbo].[Question] WHERE [created_at] IS NULL")
        ).scalar_one()
        print(f"NULL rows after: {null_after}")

        metadata = conn.execute(
            text(
                """
                SELECT
                    c.is_nullable AS is_nullable,
                    dc.name AS default_constraint_name
                FROM sys.columns AS c
                INNER JOIN sys.tables AS t
                    ON t.object_id = c.object_id
                INNER JOIN sys.schemas AS s
                    ON s.schema_id = t.schema_id
                LEFT JOIN sys.default_constraints AS dc
                    ON dc.object_id = c.default_object_id
                WHERE s.name = 'dbo'
                  AND t.name = 'Question'
                  AND c.name = 'created_at'
                """
            )
        ).mappings().first()
        print(
            "Column metadata:",
            {
                "is_nullable": metadata["is_nullable"] if metadata else None,
                "default_constraint_name": metadata["default_constraint_name"] if metadata else None,
            },
        )

    print("=== Question.created_at migration done ===")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(run_migration())
    except Exception as exc:  # noqa: BLE001
        print(f"Migration failed: {exc}")
        raise SystemExit(1)
