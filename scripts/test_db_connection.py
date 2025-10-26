#!/usr/bin/env python3
"""
Simple script to test database connection
"""

import sys
import os
from dotenv import load_dotenv

# Load environment variables from the backend .env file
backend_env_path = os.path.join(os.path.dirname(__file__), '..', 'backend', '.env')
load_dotenv(backend_env_path)

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from sqlalchemy import create_engine, text

# Create database engine directly from environment variables
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    # Fallback to constructing from individual environment variables
    USER = os.getenv('USER', 'postgres')
    PASSWORD = os.getenv('PASSWORD', '')
    HOST = os.getenv('HOST', 'localhost')
    PORT = os.getenv('PORT', '5432')
    DBNAME = os.getenv('DBNAME', 'postgres')
    DATABASE_URL = f"postgresql://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}"

print(f"Testing database connection...")
print(f"Database URL: {DATABASE_URL.replace(PASSWORD, '***') if PASSWORD else DATABASE_URL}")

try:
    # Create engine
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    
    # Test connection
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("✅ Database connection successful!")
        print(f"✅ Query result: {result.fetchone()}")
        
except Exception as e:
    print(f"❌ Database connection failed: {str(e)}")
    sys.exit(1)