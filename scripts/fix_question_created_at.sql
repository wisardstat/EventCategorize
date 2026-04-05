/* Fix dbo.Question.created_at:
   - Backfill NULL values
   - Recreate default constraint
   - Enforce NOT NULL
*/

UPDATE [dbo].[Question]
SET [created_at] = GETDATE()
WHERE [created_at] IS NULL;

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

ALTER TABLE [dbo].[Question]
ADD CONSTRAINT [DF_Question_created_at] DEFAULT (GETDATE()) FOR [created_at];

ALTER TABLE [dbo].[Question]
ALTER COLUMN [created_at] datetime2(6) NOT NULL;

SELECT
    COUNT(*) AS null_created_at_count
FROM [dbo].[Question]
WHERE [created_at] IS NULL;
