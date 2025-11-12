import sys
from app.core.config import get_settings
from sqlalchemy import create_engine, text, inspect
import time

def test_mssql_tables():
    print("Testing MSSQL table access...")
    start_time = time.time()
    
    try:
        # Get settings and create engine
        settings = get_settings()
        db_uri = settings.sqlalchemy_database_uri
        engine = create_engine(db_uri)
        
        # Create inspector to check database structure
        inspector = inspect(engine)
        
        # Get all table names
        table_names = inspector.get_table_names()
        print(f"Tables in database: {table_names}")
        
        # Test querying each table
        with engine.connect() as conn:
            for table_name in table_names:
                try:
                    # Get column info
                    columns = inspector.get_columns(table_name)
                    print(f"\nTable: {table_name}")
                    print(f"Columns: {[col['name'] for col in columns]}")
                    
                    # Try to get first 5 rows
                    result = conn.execute(text(f"SELECT TOP 5 * FROM {table_name}"))
                    rows = result.fetchall()
                    print(f"Sample data (first 5 rows): {len(rows)} rows found")
                    
                    if rows:
                        print(f"First row: {rows[0]}")
                        
                except Exception as e:
                    print(f"Error accessing table {table_name}: {str(e)}")
        
        end_time = time.time()
        print(f"\nTest completed in {end_time - start_time:.2f} seconds")
        return True
        
    except Exception as e:
        end_time = time.time()
        print(f"Error after {end_time - start_time:.2f} seconds: {str(e)}")
        return False

if __name__ == "__main__":
    test_mssql_tables()