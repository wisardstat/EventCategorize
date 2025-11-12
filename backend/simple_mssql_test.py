import sys
from app.core.config import get_settings
from sqlalchemy import create_engine, text
import time

def simple_test():
    print("Starting simple MSSQL test...")
    start_time = time.time()
    
    try:
        # Get settings
        settings = get_settings()
        print(f"MSSQL User: {settings.mssql_user}")
        print(f"MSSQL Host: {settings.mssql_host}")
        print(f"MSSQL DB: {settings.mssql_dbname}")
        
        # Get database URI
        db_uri = settings.sqlalchemy_database_uri
        print(f"Database URI: {db_uri[:50]}..." if len(db_uri) > 50 else f"Database URI: {db_uri}")
        
        # Create engine
        print("Creating engine...")
        engine = create_engine(db_uri)
        
        # Test connection with timeout
        print("Testing connection...")
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1 as test"))
            test_value = result.fetchone()[0]
            print(f"Connection successful! Test value: {test_value}")
            
            # Get database info
            result = conn.execute(text("SELECT @@VERSION as version"))
            version = result.fetchone()[0]
            print(f"MSSQL Version: {version[:100]}...")
            
        end_time = time.time()
        print(f"Test completed in {end_time - start_time:.2f} seconds")
        return True
        
    except Exception as e:
        end_time = time.time()
        print(f"Error after {end_time - start_time:.2f} seconds: {str(e)}")
        return False

if __name__ == "__main__":
    simple_test()