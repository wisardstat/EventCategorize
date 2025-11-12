import sys
from app.core.config import get_settings
from sqlalchemy import create_engine, text
import time

def create_mssql_tables():
    print("Creating MSSQL tables...")
    start_time = time.time()
    
    try:
        # Get settings and create engine
        settings = get_settings()
        db_uri = settings.sqlalchemy_database_uri
        engine = create_engine(db_uri)
        
        # SQL statements to create tables (excluding COMMENT statements and database creation)
        create_tables_sql = """
        CREATE TABLE [dbo].[Answer](
            [answer_id] [int] IDENTITY(1,1) NOT NULL,
            [question_id] [varchar](255) NOT NULL,
            [answer_text] [text] NOT NULL,
            [category] [varchar](255) NOT NULL,
            [create_user_name] [varchar](255) NULL,
            [create_user_department] [varchar](255) NULL,
            [answer_keywords] [text] NULL,
            [create_user_code] [varchar](100) NULL,
            [created_at] [datetime2](6) NULL,
            CONSTRAINT [PK__Answer__33724318BBC18F78] PRIMARY KEY CLUSTERED 
            (
                [answer_id] ASC
            )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
        ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY];

        CREATE TABLE [dbo].[idea_tank](
            [idea_seq] [int] IDENTITY(1,1) NOT NULL,
            [idea_code] [varchar](10) NULL,
            [category_idea_type1] [varchar](100) NULL,
            [idea_name] [varchar](500) NULL,
            [idea_subject] [text] NULL,
            [idea_source] [text] NULL,
            [customer_target] [text] NULL,
            [idea_inno_type] [text] NULL,
            [idea_detail] [text] NULL,
            [idea_finance_impact] [text] NULL,
            [idea_nonfinance_impact] [text] NULL,
            [idea_status] [text] NULL,
            [idea_owner_empcode] [varchar](50) NULL,
            [idea_owner_empname] [varchar](200) NULL,
            [idea_owner_deposit] [varchar](100) NULL,
            [idea_owner_contacts] [varchar](200) NULL,
            [idea_keywords] [text] NULL,
            [idea_comment] [text] NULL,
            [idea_summary_byai] [text] NULL,
            [create_datetime] [datetime2](6) NOT NULL,
            [update_datetime] [datetime2](6) NOT NULL,
            [idea_score] [bigint] NULL,
            [idea_score_comment] [text] NULL,
            [idea_status_md] [varchar](50) NULL,
            [idea_status_md_remark] [text] NULL,
            CONSTRAINT [PK__idea_tan__A03270A08174775E] PRIMARY KEY CLUSTERED 
            (
                [idea_seq] ASC
            )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
        ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY];

        CREATE TABLE [dbo].[idea_users](
            [user_code] [varchar](50) NOT NULL,
            [user_fname] [varchar](100) NOT NULL,
            [user_lname] [varchar](100) NOT NULL,
            [user_login] [varchar](50) NOT NULL,
            [user_password] [varchar](255) NOT NULL,
            [user_createdate] [datetime2](6) NOT NULL,
            [user_updatedate] [datetime2](6) NOT NULL,
            [user_role] [varchar](50) NULL,
            CONSTRAINT [PK__idea_use__EDC4140E0026DF95] PRIMARY KEY CLUSTERED 
            (
                [user_code] ASC
            )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
            CONSTRAINT [UQ__idea_use__9EA1B5AFAB9A654A] UNIQUE NONCLUSTERED 
            (
                [user_login] ASC
            )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
        ) ON [PRIMARY];

        CREATE TABLE [dbo].[tb_setting](
            [set_code] [varchar](50) NOT NULL,
            [set_name] [varchar](255) NULL,
            [set_value] [varchar](max) NOT NULL,
            [set_description] [varchar](max) NULL,
            [create_datetime] [datetime2](6) NOT NULL,
            [update_datetime] [datetime2](6) NOT NULL,
            CONSTRAINT [PK__tb_setti__A6E4DB69CF7B4952] PRIMARY KEY CLUSTERED 
            (
                [set_code] ASC
            )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
        ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY];

        CREATE TABLE [dbo].[Question](
            [question_id] [varchar](100) NOT NULL,
            [question_title] [varchar](500) NOT NULL,
            [question_description] [varchar](max) NULL,
            [question_categories] [nvarchar](max) NULL,
            [qrcode_url] [varchar](500) NULL,
            [created_at] [datetime2](6) NULL,
            CONSTRAINT [PK__Question__2EC21549A0D0D8A0] PRIMARY KEY CLUSTERED 
            (
                [question_id] ASC
            )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
        ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY];
        """
        
        # Execute the SQL statements
        with engine.connect() as conn:
            # Split SQL into individual statements and execute them
            statements = create_tables_sql.split(';')
            for statement in statements:
                statement = statement.strip()
                if statement and not statement.startswith('--'):
                    try:
                        conn.execute(text(statement))
                        conn.commit()
                        print(f"Executed: {statement[:50]}...")
                    except Exception as e:
                        print(f"Error executing statement: {statement[:50]}...")
                        print(f"Error: {str(e)}")
                        # Continue with next statement
        
        end_time = time.time()
        print(f"\nTables created successfully in {end_time - start_time:.2f} seconds")
        return True
        
    except Exception as e:
        end_time = time.time()
        print(f"Error after {end_time - start_time:.2f} seconds: {str(e)}")
        return False

if __name__ == "__main__":
    create_mssql_tables()